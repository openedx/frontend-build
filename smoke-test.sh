# exit on any errors in commands below
# https://stackoverflow.com/questions/90418/exit-shell-script-based-on-process-exit-code
set -e
node ./bin/fedx-scripts jest --coverage plugins
cd example
npm install
npm run lint
npm run test
npm run build
npm run babel
cd ../
