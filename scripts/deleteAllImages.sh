
scriptDir=$(CDPATH= cd -- "$(dirname -- "$0")" && pwd)
e2eFolder="$scriptDir/../e2e"
#delete all images inside the e2e folder by searching for image files and removing them recursively
if [[ ! -d "$e2eFolder" ]]; then
	printf 'Error: e2e folder not found: %s\n' "$e2eFolder" >&2
	exit 1
fi

find "$e2eFolder" -type f -name "*.png" -delete