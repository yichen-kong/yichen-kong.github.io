"""Reproduce qinghai-dem.json using the public Open Topo Data SRTM v3 API.

Python standard library only. Run explicitly; the website never calls this API.
97 x 65 point samples over the Qinghai bounding region, not a full-resolution DEM.
Stops on missing data rather than fabricating elevations. Respects 1 call/sec.
"""
import datetime
import json
import math
import pathlib
import time
import urllib.parse
import urllib.request

ROOT = pathlib.Path(__file__).resolve().parent
ENDPOINT = "https://api.opentopodata.org/v1/srtm90m"
WEST, EAST, SOUTH, NORTH = 89.3, 103.1, 31.5, 39.3
COLS, ROWS = 97, 65
DX, DY = (EAST - WEST) / (COLS - 1), (NORTH - SOUTH) / (ROWS - 1)
points = [
    (round(NORTH - row * DY, 8), round(WEST + col * DX, 8))
    for row in range(ROWS) for col in range(COLS)
]
elevations = []
for start in range(0, len(points), 100):
    batch = points[start:start + 100]
    query = urllib.parse.urlencode({
        "locations": "|".join(f"{lat},{lon}" for lat, lon in batch),
        "interpolation": "bilinear",
    })
    for attempt in range(4):
        time.sleep(1.1 + attempt * 3)
        try:
            with urllib.request.urlopen(ENDPOINT + "?" + query, timeout=60) as response:
                result = json.load(response)
            assert result["status"] == "OK", result
            assert len(result["results"]) == len(batch)
            for entry, (lat, lon) in zip(result["results"], batch):
                assert entry["dataset"] == "srtm90m"
                assert entry["location"] == {"lat": lat, "lng": lon}
                value = entry["elevation"]
                assert isinstance(value, (int, float)) and math.isfinite(value)
                assert 0 < value < 9000, (lat, lon, value)
            break
        except Exception:
            if attempt == 3:
                raise
    elevations.extend(entry["elevation"] for entry in result["results"])
    print(f"{len(elevations)}/{len(points)}", flush=True)

data = {
    "schema": 1,
    "title": "Qinghai bounding rectangle elevation sample (not a provincial boundary)",
    "bounds": {"west": WEST, "east": EAST, "south": SOUTH, "north": NORTH},
    "columns": COLS,
    "rows": ROWS,
    "order": "north-to-south rows, west-to-east columns",
    "stepDegrees": {"longitude": round(DX, 8), "latitude": round(DY, 8)},
    "units": "metres",
    "horizontalDatum": "WGS84",
    "verticalDatum": "EGM96 orthometric height",
    "source": {
        "dataset": "NASA/USGS SRTMGL3 v003 (SRTM 90 m)",
        "endpoint": ENDPOINT,
        "documentation": "https://www.opentopodata.org/datasets/srtm/",
        "product": "https://doi.org/10.5067/MEaSUREs/SRTM/SRTMGL3.003",
        "interpolation": "bilinear; integer source may round returned heights",
        "retrieved": datetime.datetime.now(datetime.timezone.utc).isoformat(),
        "acquisition": "2000-02-11/2000-02-22",
    },
    "limitations": "Point-sampled at about 13.1 x 13.6 km near 35.4 N, not area-averaged. "
                    "Bounding rectangle includes neighbouring regions and is not a provincial boundary. "
                    "Not survey-grade, not province-clipped. No synthetic heights.",
    "elevations": elevations,
}
target = ROOT / "qinghai-dem.json"
target.write_text(json.dumps(data, separators=(",", ":")) + "\n", encoding="utf-8")
print(f"{target}: {min(elevations)}..{max(elevations)} m", flush=True)
