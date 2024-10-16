#!/bin/bash

# Check if the app name is provided
if [ -z "$1" ]; then
    echo "Error: No app name provided."
    echo "Usage: $0 <app_name> <source_icon>"
    exit 1
fi

# Check if the source icon is provided
if [ -z "$2" ]; then
    echo "Error: No source icon provided."
    echo "Usage: $0 <app_name> <source_icon>"
    exit 1
fi

APP_NAME=$1
SOURCE_ICON=$2

# Get the directory of the script
SCRIPT_DIR=$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)
echo "Script directory: $SCRIPT_DIR"

# Check if the icon file exists
if [ ! -f "$SOURCE_ICON" ]; then
    echo "Error: Icon file not found at $SOURCE_ICON"
    exit 1
fi

echo "Using icon at: $SOURCE_ICON for app: $APP_NAME"

# Android icon sizes
SIZES=(48 72 96 144 192)
DENSITIES=(mdpi hdpi xhdpi xxhdpi xxxhdpi)

# Check if ImageMagick is installed
if ! command -v magick &> /dev/null; then
    echo "Error: ImageMagick is not installed. Please install it and try again."
    exit 1
fi

for i in "${!SIZES[@]}"; do
    SIZE=${SIZES[$i]}
    DENSITY=${DENSITIES[$i]}
    
    OUTPUT_DIR="${SCRIPT_DIR}/android/app/src/main/res/mipmap-${DENSITY}"
    mkdir -p "$OUTPUT_DIR"
    
    echo "Generating icon for density: $DENSITY, size: ${SIZE}x${SIZE}"
    echo "Source icon: $SOURCE_ICON"
    echo "Output directory: $OUTPUT_DIR"
    
    magick "$SOURCE_ICON" -resize ${SIZE}x${SIZE} "${OUTPUT_DIR}/ic_launcher.png"
    if [ $? -ne 0 ]; then
        echo "Error: Failed to create ic_launcher.png for ${DENSITY}"
        continue
    fi
    
    if [ ! -f "${OUTPUT_DIR}/ic_launcher.png" ]; then
        echo "Error: ic_launcher.png was not created in ${OUTPUT_DIR}"
        continue
    else
        echo "Successfully created ${OUTPUT_DIR}/ic_launcher.png"
    fi

    magick "$SOURCE_ICON" -resize ${SIZE}x${SIZE} \
        \( +clone -alpha extract -draw 'fill black polygon 0,0 0,50 50,0 fill white circle 50,50 50,0' \
           \( +clone -flip \) -compose Multiply -composite \
           \( +clone -flop \) -compose Multiply -composite \
        \) -alpha off -compose CopyOpacity -composite "${OUTPUT_DIR}/ic_launcher_round.png"
    if [ $? -ne 0 ]; then
        echo "Error: Failed to create ic_launcher_round.png for ${DENSITY}"
        continue
    fi

    if [ ! -f "${OUTPUT_DIR}/ic_launcher_round.png" ]; then
        echo "Error: ic_launcher_round.png was not created in ${OUTPUT_DIR}"
    else
        echo "Successfully created ${OUTPUT_DIR}/ic_launcher_round.png"
    fi
done

echo "Icon generation complete for app: $APP_NAME."