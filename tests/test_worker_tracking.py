import numpy as np
from src.core.worker_tracker import WorkerReIDGallery
from src.core.detector import PPEDetector

def test_distinct_workers_get_distinct_ids():
    gallery = WorkerReIDGallery(ttl_seconds=1800.0, match_threshold=0.85)
    
    # Frame simulation
    frame = np.zeros((480, 640, 3), dtype=np.uint8)
    
    # Worker 1 box (left side)
    box1 = [50.0, 50.0, 150.0, 400.0]
    # Worker 2 box (right side)
    box2 = [400.0, 50.0, 500.0, 400.0]
    
    # Worker 1 red shirt
    frame[50:400, 50:150, 2] = 255
    # Worker 2 blue shirt
    frame[50:400, 400:500, 0] = 255
    
    id1 = gallery.match_or_register(1, frame, box1, 100.0, exclude_ids=set())
    id2 = gallery.match_or_register(2, frame, box2, 100.0, exclude_ids={id1})
    
    assert id1 != id2, "Worker 1 and Worker 2 must be assigned distinct unique IDs!"

def test_spatial_memory_isolation():
    detector = PPEDetector()
    
    # Worker A box (left)
    boxA = [20.0, 30.0, 100.0, 300.0]
    # Worker B box (far right)
    boxB = [450.0, 30.0, 530.0, 300.0]
    
    sim = detector._compute_walk_robust_similarity(boxA, boxB)
    assert sim < 0.10, "Distant workers must have low spatial similarity!"
