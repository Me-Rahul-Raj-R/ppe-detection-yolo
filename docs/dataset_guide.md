# EdgeVision Dataset Structure & Labelling Guide

This guide details the dataset composition, class labels, and augmentation strategies for the **Industrial PPE and Work-at-Height** safety model.

---

## 🏷️ Class Definitions (8 Classes)

| Class Index | Class Name | Description |
| :---: | :--- | :--- |
| `0` | `person` | Worker body detection bounding box |
| `1` | `helmet` | Safety helmet / hard hat |
| `2` | `vest` | High-visibility reflective safety vest |
| `3` | `boots` | Industrial safety boots |
| `4` | `safety_belt` | Work-at-height harness / safety belt |
| `5` | `lanyard` | Fall arrest lanyard strap |
| `6` | `hook` | Carabiner / snap hook |
| `7` | `anchor_point` | Lifeline anchor attachment point |

---

## 📁 Dataset Folder Structure (YOLO Format)

```
dataset/
├── data.yaml
├── train/
│   ├── images/
│   └── labels/
├── val/
│   ├── images/
│   └── labels/
└── test/
    ├── images/
    └── labels/
```

### `data.yaml` Schema
```yaml
path: ./dataset
train: train/images
val: val/images
test: test/images

names:
  0: person
  1: helmet
  2: vest
  3: boots
  4: safety_belt
  5: lanyard
  6: hook
  7: anchor_point
```

---

## 🔍 Small-Object Detection & Hard Negative Augmentations

- **Small-Object Augmentation**: Random cropping and copy-paste mosaic augmentation applied to small pixel objects (hooks, lanyards, boots).
- **Hard Negative Filtering**: Includes machinery (yellow cranes/excavators) to avoid false helmet detections, and reflective vest-like scaffolding materials.
