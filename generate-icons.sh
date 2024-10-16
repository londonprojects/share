#!/bin/bash

# Function to generate icons for a single app
generate_icons() {
    local APP_NAME=$1
    local SOURCE_ICON=$2

    # Get the directory of the script
    SCRIPT_DIR=$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)
    echo "Script directory: $SCRIPT_DIR"

    # Check if the icon file exists
    if [ ! -f "$SOURCE_ICON" ]; then
        echo "Error: Icon file not found at $SOURCE_ICON"
        exit 1
    fi

    echo "Using icon at: $SOURCE_ICON for app: $APP_NAME"

    # Android icon sizes and densities
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
        
        magick "$SOURCE_ICON" -resize ${SIZE}x${SIZE} "${OUTPUT_DIR}/ic_launcher_${APP_NAME}.png"
        if [ $? -ne 0 ]; then
            echo "Error: Failed to create ic_launcher_${APP_NAME}.png for ${DENSITY}"
            continue
        fi
        
        if [ ! -f "${OUTPUT_DIR}/ic_launcher_${APP_NAME}.png" ]; then
            echo "Error: ic_launcher_${APP_NAME}.png was not created in ${OUTPUT_DIR}"
            continue
        else
            echo "Successfully created ${OUTPUT_DIR}/ic_launcher_${APP_NAME}.png"
        fi

        magick "$SOURCE_ICON" -resize ${SIZE}x${SIZE} \
            \( +clone -alpha extract -draw 'fill black polygon 0,0 0,50 50,0 fill white circle 50,50 50,0' \
               \( +clone -flip \) -compose Multiply -composite \
               \( +clone -flop \) -compose Multiply -composite \
            \) -alpha off -compose CopyOpacity -composite "${OUTPUT_DIR}/ic_launcher_round_${APP_NAME}.png"
        if [ $? -ne 0 ]; then
            echo "Error: Failed to create ic_launcher_round_${APP_NAME}.png for ${DENSITY}"
            continue
        fi

        if [ ! -f "${OUTPUT_DIR}/ic_launcher_round_${APP_NAME}.png" ]; then
            echo "Error: ic_launcher_round_${APP_NAME}.png was not created in ${OUTPUT_DIR}"
        else
            echo "Successfully created ${OUTPUT_DIR}/ic_launcher_round_${APP_NAME}.png"
        fi
    done

    echo "Icon generation complete for app: $APP_NAME."
}

# Function to load app names from a configuration file
load_apps() {
    local CONFIG_FILE=$1
    if [ ! -f "$CONFIG_FILE" ]; then
        echo "Error: Configuration file not found at $CONFIG_FILE"
        exit 1
    fi
    APPS=($(grep -v '^#' "$CONFIG_FILE"))
}

# Check if the app name is provided
if [ -z "$1" ]; then
    echo "Error: No app name or 'all' provided."
    echo "Usage: $0 <app_name> <source_icon> or $0 all <source_icon> or $0 -c <config_file> <source_icon>"
    exit 1
fi

# Check if the source icon is provided
if [ -z "$2" ]; then
    echo "Error: No source icon provided."
    echo "Usage: $0 <app_name> <source_icon> or $0 all <source_icon> or $0 -c <config_file> <source_icon>"
    exit 1
fi

APP_NAME=$1
SOURCE_ICON=$2
CONFIG_FILE=""

# Check if the -c option is used for configuration file
if [ "$1" == "-c" ]; then
    if [ -z "$3" ]; then
        echo "Error: No configuration file provided."
        echo "Usage: $0 -c <config_file> <source_icon>"
        exit 1
    fi
    CONFIG_FILE=$2
    SOURCE_ICON=$3
    load_apps "$CONFIG_FILE"
    APP_NAME="all"
fi

if [ "$APP_NAME" == "all" ]; then
    if [ -z "$APPS" ]; then
        APPS=(
          'YogaPlatform'
          'RealEstateMarketplace'
          'YachtMarketplace'
          'PetSitting'
          'Marketplace'
          'StorageSharing'
          'FlatSwapping'
          'RequestHandling'
          'Ticketing'
          'SchengenShuffle'
          'LifeInTheUK'
          'DrivingTheory'
          'HunterBuddy'
          'Split'
          'ShareApp'
        )
    fi

    for APP in "${APPS[@]}"; do
        echo "Generating icons for app: $APP"
        generate_icons "$APP" "$SOURCE_ICON"
    done

    echo "Icon generation complete for all apps."
else
    generate_icons "$APP_NAME" "$SOURCE_ICON"
fi

# How to run
# Single App: ./generate-icons.sh <app_name> <source_icon>
# All Apps: ./generate-icons.sh all <source_icon>
# Configuration File: ./generate-icons.sh -c <config_file> <source_icon>