from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
from dotenv import load_dotenv
from pathlib import Path
import logging

from database import init_db, close_db
from config import get_settings
from routes import auth_routes, service_routes, product_routes, appointment_routes
from routes import cash_register_routes, service_history_routes, push_token_routes

# Load environment variables
ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

settings = get_settings()

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

@asynccontextmanager
async def lifespan(app: FastAPI):
    """Manage application startup and shutdown"""
    logger.info("Starting Barbershop API...")
    try:
        await init_db()
        logger.info("Database initialized successfully")
    except Exception as e:
        logger.error(f"Failed to initialize database: {e}")
    
    yield
    
    logger.info("Shutting down Barbershop API...")
    await close_db()

# Create FastAPI app
app = FastAPI(
    title="Barbershop Manager API",
    description="API for barbershop management system",
    version="1.0.0",
    lifespan=lifespan
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers with /api prefix
app.include_router(auth_routes.router, prefix="/api")
app.include_router(service_routes.router, prefix="/api")
app.include_router(product_routes.router, prefix="/api")
app.include_router(appointment_routes.router, prefix="/api")
app.include_router(cash_register_routes.router, prefix="/api")
app.include_router(service_history_routes.router, prefix="/api")
app.include_router(push_token_routes.router, prefix="/api")

@app.get("/api/health")
async def health_check():
    """Health check endpoint"""
    return {
        "status": "healthy",
        "service": "Barbershop Manager API",
        "version": "1.0.0"
    }

@app.get("/api")
async def root():
    """Root endpoint"""
    return {
        "message": "Barbershop Manager API",
        "docs": "/docs",
        "health": "/api/health"
    }
