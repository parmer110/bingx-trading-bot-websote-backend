#!/bin/bash


#--- redis ---#

# NOTE: make sure that redis database is installed on the server.
echo "initiating redis database..."

# kill redis-server current live instances if existed
lsof -i :6379 | awk 'NR>1 {print $2}' | grep -q . && sudo xargs kill <<< $(lsof -i :6379 | awk 'NR>1 {print $2}')

# run  redis-server in background and log outputs into redis.log
nohup redis-server > ~/redis.log 2>&1 &


#--- celery ---#

echo "running celery worker..."

cd ~/bingx-trading-bot-website/backend/

# activate python virtual environment
source venv/bin/activate

# install python dependencies
pip3 install -r requirements.txt

# run celery in background and log outputs into celery.log
nohup celery -A app.celery_app worker --loglevel=info -P gevent > ~/celery.log 2>&1 &


#--- backend fastapi ---#

echo "running fastapi backend..."

# kill fastapi current live instances
lsof -i :8000 | awk 'NR>1 {print $2}' | grep -q . && sudo xargs kill <<< $(lsof -i :6379 | awk 'NR>1 {print $2}')

# run fastapi in background and log outputs into fastapi.log
nohup uvicorn app.main:app --port 8000 > ~/fastapi.log 2>&1 &


#--- frontend react+vite ---#

echo "running "

cd ~/bingx-trading-bot-website/frontend/

echo "npm installing packages..."
npm install

echo "npm building the project..."
npm run build

echo "removing current files in /var/www/almastalayi.ir/ ..."
rm -r -f /var/www/almastalayi.ir/*

echo "moving the production built files to /var/www/almastalayi.ir/ ..."
mv dist/* /var/www/almastalayi.ir/

echo "updating /var/www/almastalayi.ir/ files access..."
chmod -R 755 /var/www/almastalayi.ir
chown -R www-data:www-data /var/www/almastalayi.ir

echo "restarting nginx..."
systemctl restart nginx

echo "AlamasTalayi.ir setup finished successfully."
