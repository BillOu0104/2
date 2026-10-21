#!/usr/bin/env python3
"""Decode first mip of locally supplied Wallpaper Engine TEXV0005/TEXB0004.
No network access. Requires Pillow and liblz4.so.1 (system library).
Source assets stay in the user's local project; manifest records provenance.
"""
from pathlib import Path
import argparse, ctypes, hashlib, io, json, struct
from PIL import Image

ROOT = Path(__file__).resolve().parents[1]
DEFAULT_NAMES = ['B8k', 'BB8k3', 'st2', 'sa3', '0sun', '0aun', '0dq']

def u32(data, offset):
    return struct.unpack_from('<I', data, offset)[0]

def decode(path):
    data = path.read_bytes()
    if not data.startswith(b'TEXV0005\0TEXI0001\0'):
        raise ValueError('Unsupported TEX header')
    fmt, actual_w, actual_h = u32(data, 18), u32(data, 34), u32(data, 38)
    block = data.find(b'TEXB0004\0')
    if block < 0:
        raise ValueError('Missing TEXB0004')
    offset = block + 9
    image_count, embedded_fmt, unknown, mip_count = struct.unpack_from('<4I', data, offset)
    if image_count != 1 or not mip_count:
        raise ValueError(f'Unsupported image count / mip count: {image_count}/{mip_count}')
    width, height, compressed, raw_size, stored_size = struct.unpack_from('<5I', data, offset + 16)
    raw = data[offset + 36:offset + 36 + stored_size]
    if len(raw) != stored_size:
        raise ValueError('Truncated first mip')
    if compressed:
        if raw_size <= 0 or raw_size > 512 * 1024 * 1024:
            raise ValueError('Invalid uncompressed mip size')
        lz4 = ctypes.CDLL('liblz4.so.1')
        lz4.LZ4_decompress_safe.argtypes = [ctypes.c_void_p, ctypes.c_void_p, ctypes.c_int, ctypes.c_int]
        lz4.LZ4_decompress_safe.restype = ctypes.c_int
        source, destination = ctypes.create_string_buffer(raw), ctypes.create_string_buffer(raw_size)
        result = lz4.LZ4_decompress_safe(source, destination, len(raw), raw_size)
        if result != raw_size:
            raise ValueError(f'LZ4 decoded {result}, expected {raw_size}')
        raw = destination.raw
    if raw.startswith(b'\x89PNG\r\n\x1a\n') or raw.startswith(b'\xff\xd8'):
        image = Image.open(io.BytesIO(raw)).convert('RGBA')
    elif fmt == 0:
        image = Image.frombytes('RGBA', (width, height), raw)
    elif fmt in (4, 7):
        # Pillow's BCn decoder expects the same payload used by a DDS file.
        image = Image.frombytes('RGBA', (width, height), raw, 'bcn', (3 if fmt == 4 else 1, 'DXT5' if fmt == 4 else 'DXT1'))
    else:
        raise ValueError(f'Unsupported texture format {fmt}')
    # TEX retains allocation padding; crop to original dimensions.
    image = image.crop((0, 0, min(actual_w, image.width), min(actual_h, image.height)))
    return image, {'format': fmt, 'firstMip': [width, height], 'originalSize': [actual_w, actual_h], 'mipCount': mip_count, 'lz4': bool(compressed), 'sha256': hashlib.sha256(data).hexdigest()}

def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--source', type=Path, default=ROOT / 'unpacked/materials')
    parser.add_argument('--output', type=Path, default=Path('/workspace/sites/three-body/assets/original'))
    parser.add_argument('--max-size', type=int, default=4096)
    parser.add_argument('names', nargs='*', default=DEFAULT_NAMES)
    args = parser.parse_args()
    args.output.mkdir(parents=True, exist_ok=True)
    manifest = {'sourceProject': '三体实时演算 | Three-Body problem - SYKM', 'workshopId': '3509243656', 'scope': 'Local user-supplied source, browser texture conversion only', 'assets': []}
    for name in args.names:
        source = args.source / f'{name}.tex'
        image, record = decode(source)
        image.thumbnail((args.max_size, args.max_size), Image.Resampling.LANCZOS)
        output = args.output / f'{name}.webp'
        image.save(output, 'WEBP', quality=91, method=6)
        record.update({'source': str(source), 'output': output.name, 'outputSize': list(image.size), 'outputBytes': output.stat().st_size, 'outputSha256': hashlib.sha256(output.read_bytes()).hexdigest()})
        manifest['assets'].append(record)
        print(f'{name}: {image.width} x {image.height}, {output.stat().st_size:,} bytes')
    (args.output / 'manifest.json').write_text(json.dumps(manifest, ensure_ascii=False, indent=2) + '\n')

if __name__ == '__main__':
    main()
