# Set the database URL environment variable
$env:DATABASE_URL = "postgresql://neondb_owner:npg_OV6RQUkDo3Sg@ep-purple-heart-a5f81sfk.us-east-2.aws.neon.tech/neondb?sslmode=require"

# Run the Docker container in detached mode
$containerId = docker run -d -p 5000:5000/tcp -e DATABASE_URL=$env:DATABASE_URL restexpress:latest

# Execute 'npm run dev' inside the running container
docker exec -it $containerId npm run dev