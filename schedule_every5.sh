time_now=$(date '+%FT%H:%M:00+07:00')
fivemin_before=$(date '+%FT%H:%M:00+07:00' --date '-5 min')
echo $time_now
echo $fivemin_before
# response=$(curl --insecure --location --request POST 'https://192.168.2.102/artemis-web/debug' --header 'Content-Type: application/json' --data '{ "httpMethod": "POST", "path": "/api/pms/v1/crossRecords/page", "headers": {}, "query": {}, "parameter": {}, "body": {     "cameraIndexCode": "2",     "pageNo": 1,     "pageSize": 500,     "startTime": "'$fivemin_before'",     "endTime": "'$time_now'" }, "contentType": "application/json;charset=UTF-8", "mock": false, "appKey": "21477259", "appSecret": "ldBw3m2z9HP4xcFfMdYo"}')

# echo $time_now
# echo $fivemin_before
# http_code=$(tail -n1 <<< "$response")  # get the last line
# content=$(sed '$ d' <<< "$response")   # get all but the last line which contains the status code

# echo "CODE : $http_code"
# echo "CONTENT : $content"
# # echo "$result" | grep -oP "^[^a-zA-Z0-9]"

# echo $response | grep -Eo '"[^"]*" *(: *([0-9]*|"[^"]*")[^{}\["]*|,)?|[^"\]\[\}\{]*|\{|\},?|\[|\],?|[0-9 ]*,?' | awk '{if ($0 ~ /^[}\]]/ ) offset-=4; printf "%*c%s\n", offset, " ", $0; if ($0 ~ /^[{\[]/) offset+=4}'
fetch_latest_lts_version() {
    echo "Fetching the latest LTS Python version..."

    # Get the latest LTS version from the Python website
    # Parsing the LTS version directly might require updating based on the structure of the site
    LTS_VERSION=$(curl -s https://www.python.org/downloads/ | \
        grep -oP 'Python \K[0-9]+\.[0-9]+' | \
        sort -V | \
        tail -n 1)
    
    echo "Latest LTS version: $LTS_VERSION"
    echo $LTS_VERSION
}
# Define the Python script to be run
PYTHON_SCRIPT="script.py"  # Replace with your Python script filename

# Function to run Python script on Linux/macOS
run_python_unix() {
    if command -v python3 >/dev/null 2>&1; then
        python3 "$PYTHON_SCRIPT"
    elif command -v python >/dev/null 2>&1; then
        python "$PYTHON_SCRIPT"
    else
        echo "Python is not installed. Please install Python and try again."
        exit 1
    fi
}

# Function to run Python script on Windows via Git Bash or WSL
run_python_windows() {
    if command -v python3 >/dev/null 2>&1; then
        python3 "$PYTHON_SCRIPT"
        exit 1
    elif command -v python >/dev/null 2>&1; then
        python "$PYTHON_SCRIPT"
        exit 1
    else
        echo "Python is not installed. Please install Python and try again."
        exit 1
    fi
}

# Main script logic
if [ "$(uname)" == "Darwin" ]; then
    # macOS
    echo "Detected macOS."
    run_python_unix
elif [ -f /etc/debian_version ] || [ -f /etc/ubuntu-release ]; then
    # Debian-based Linux (e.g., Ubuntu)
    echo "Detected Debian-based Linux."
    run_python_unix
elif [ -f /etc/redhat-release ]; then
    # Red Hat-based Linux (e.g., CentOS, Fedora)
    echo "Detected Red Hat-based Linux."
    run_python_unix
elif [ "$(uname -o)" == "Msys" ] || [ "$(uname -o)" == "Cygwin" ]; then
    # Windows via MSYS or Cygwin
    echo "Detected Windows via Unix-like environment."
    run_python_windows
else
    echo "Unsupported operating system or environment. Please run the Python script manually."
    exit 1
fi

# case "$OSTYPE" in
#   solaris*) echo "SOLARIS" ;;
#   darwin*)  echo "OSX" ;; 
#   linux*)   echo "LINUX" ;;
#   bsd*)     echo "BSD" ;;
#   msys*)    echo "WINDOWS" ;;
#   cygwin*)  echo "WINDOWS (win32)" ;;
#   *)        echo "unknown: $OSTYPE" ;;
# esac