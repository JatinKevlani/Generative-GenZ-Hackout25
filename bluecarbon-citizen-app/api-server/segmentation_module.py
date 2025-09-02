from roboflow import Roboflow
import supervision as sv
import cv2
import numpy as np
from dotenv import load_dotenv
import os
from datetime import datetime
import logging

logger = logging.getLogger(__name__)


class SegmentationModel:
    """
    Handles image segmentation using Roboflow model.
    Includes grass stress detection (Healthy / Stressed).
    """

    def __init__(self):
        """Initialize the segmentation model."""
        load_dotenv()
        self.api_key = os.getenv("ROBOFLOW_API_KEY")

        if not self.api_key:
            raise ValueError("ROBOFLOW_API_KEY not found in environment variables")

        # Initialize Roboflow
        self.rf = Roboflow(api_key=self.api_key)
        self.project = self.rf.workspace().project("segmentation-sohpz")
        self.model = self.project.version(9).model

        # Mask annotator (label annotator is recreated dynamically per image)
        self.mask_annotator = sv.MaskAnnotator(
            color=sv.ColorPalette.DEFAULT, opacity=0.5
        )

        logger.info("Segmentation model initialized successfully")

    def get_model_info(self):
        """
        Get information about the loaded model.
        """
        try:
            return {
                "status": "loaded",
                "workspace": self.project.workspace.name
                if hasattr(self.project, "workspace")
                else "unknown",
                "project": self.project.name
                if hasattr(self.project, "name")
                else "segmentation-sohpz",
                "version": "9",
                "model_type": "segmentation",
                "api_key_status": "configured" if self.api_key else "missing",
                "classes": ["grass"],  # Add your actual classes here
                "timestamp": datetime.now().isoformat(),
            }
        except Exception as e:
            logger.error(f"Error getting model info: {str(e)}")
            return {
                "status": "error",
                "error": str(e),
                "timestamp": datetime.now().isoformat(),
            }

    def classify_grass_health(self, mask, img):
        """
        Classify grass health based on average green ratio.
        """
        grass_pixels = img[mask > 0]

        if len(grass_pixels) == 0:
            return "Unknown"

        avg_b, avg_g, avg_r = np.mean(grass_pixels, axis=0)
        green_ratio = avg_g / (avg_r + 1e-6)

        return "Healthy" if green_ratio > 1.2 else "Stressed"

    def predict_and_annotate(self, image_path, confidence=50, output_folder="outputs"):
        """
        Run prediction, annotate image, and classify grass health.
        Ensures labels are dynamically scaled and stay inside image.
        """
        try:
            # Run prediction
            result = self.model.predict(image_path, confidence=confidence).json()
            detections = sv.Detections.from_inference(result)

            # Load original image
            image = cv2.imread(image_path)
            if image is None:
                raise Exception("Failed to load image")

            h, w = image.shape[:2]

            # Dynamic scaling based on image size
            scale_factor = max(h, w) / 1000
            text_scale = 1.0 * scale_factor
            text_thickness = max(1, int(2 * scale_factor))
            text_padding = max(4, int(6 * scale_factor))

            # Reinitialize label annotator dynamically
            label_annotator = sv.LabelAnnotator(
                text_scale=text_scale,
                text_thickness=text_thickness,
                text_padding=text_padding,
            )

            # Build labels (add stress detection for grass)
            labels = []
            safe_boxes = []

            # Estimate label height (adjust multiplier if needed)
            label_height = int(
                (text_scale * 20) + text_padding * 2 + text_thickness * 2
            )

            for i, pred in enumerate(result["predictions"]):
                class_name = pred["class"]
                label = f"{class_name}"

                if class_name.lower() == "grass" and "points" in pred:
                    points = np.array(
                        [[p["x"], p["y"]] for p in pred["points"]], dtype=np.int32
                    )
                    mask = np.zeros(image.shape[:2], dtype=np.uint8)
                    cv2.fillPoly(mask, [points], 255)

                    health_status = self.classify_grass_health(mask, image)
                    label = f"{class_name} ({health_status})"

                labels.append(label)

                # Clamp xyxy bounding boxes instead of xywh
                x1, y1, x2, y2 = detections.xyxy[i]

                # Clamp inside image and ensure enough space for label
                x1 = max(0, min(int(x1), w - 1))
                y1 = max(
                    label_height, min(int(y1), h - 1)
                )  # Ensure enough space for label
                x2 = max(0, min(int(x2), w - 1))
                y2 = max(0, min(int(y2), h - 1))

                safe_boxes.append([x1, y1, x2, y2])

            # Build a new detections object with corrected boxes
            detections = sv.Detections(
                xyxy=np.array(safe_boxes, dtype=np.float32),
                confidence=detections.confidence,
                class_id=detections.class_id,
                mask=detections.mask,
            )

            # Apply annotations
            annotated_image = self.mask_annotator.annotate(
                scene=image, detections=detections
            )
            annotated_image = label_annotator.annotate(
                scene=annotated_image, detections=detections, labels=labels
            )

            # Generate output filename
            timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
            base_name = os.path.splitext(os.path.basename(image_path))[0]
            output_filename = f"{base_name}_annotated_{timestamp}.jpg"
            output_path = os.path.join(output_folder, output_filename)

            # Save annotated image
            os.makedirs(output_folder, exist_ok=True)
            cv2.imwrite(output_path, annotated_image)

            return {
                "success": True,
                "labels": labels,
                "annotated_image_path": output_path,
                "raw_predictions": result["predictions"],
                "confidence_threshold": confidence,
                "timestamp": datetime.now().isoformat(),
            }

        except Exception as e:
            logger.error(f"Prediction and annotation failed: {str(e)}")
            raise Exception(f"Prediction and annotation failed: {str(e)}")
