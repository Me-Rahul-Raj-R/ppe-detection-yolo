"""
EdgeVision TensorRT FP16 / INT8 Engine Generation Script
Generates high-performance TensorRT engines from ONNX models for Jetson Orin deployment.
"""

import argparse
import subprocess
import sys
import os

def build_tensorrt_engine(onnx_file: str, engine_file: str = "best.engine", precision: str = "fp16"):
    if not os.path.exists(onnx_file):
        print(f"Error: ONNX file {onnx_file} not found. Export to ONNX first using export_onnx.py")
        sys.exit(1)

    print(f"--- Generating TensorRT Engine ({precision.upper()}) ---")
    print(f"Input ONNX: {onnx_file}")
    print(f"Output Engine: {engine_file}")

    cmd = [
        "trtexec",
        f"--onnx={onnx_file}",
        f"--saveEngine={engine_file}",
        "--verbose"
    ]

    if precision.lower() == "fp16":
        cmd.append("--fp16")
    elif precision.lower() == "int8":
        cmd.append("--int8")
        cmd.append("--best")

    cmd_str = " ".join(cmd)
    print(f"Executing command: {cmd_str}")

    try:
        res = subprocess.run(cmd, check=True)
        print(f"TensorRT Engine build successful: {engine_file}")
    except FileNotFoundError:
        print("\nNote: 'trtexec' command not found in PATH.")
        print("To build TensorRT engines on NVIDIA Jetson Orin or CUDA desktop, run:")
        print(f"  {cmd_str}\n")
    except subprocess.CalledProcessError as e:
        print(f"TensorRT engine build failed: {e}")

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Build TensorRT Engine for Jetson")
    parser.add_argument("--onnx", type=str, default="best.onnx", help="Input ONNX file")
    parser.add_argument("--output", type=str, default="best.engine", help="Output TensorRT engine file")
    parser.add_argument("--precision", type=str, choices=["fp16", "int8", "fp32"], default="fp16", help="Engine precision mode")
    args = parser.parse_args()

    build_tensorrt_engine(args.onnx, args.output, args.precision)
