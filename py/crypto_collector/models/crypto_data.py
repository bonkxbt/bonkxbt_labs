from dataclasses import dataclass
from datetime import datetime
from typing import Optional

@dataclass
class PriceData:
    symbol: str  # Cryptocurrency symbol (e.g., BTC)
    price: float  # Current price of the cryptocurrency
    timestamp: datetime  # Last updated timestamp
    
@dataclass
class MarketData:
    symbol: str  # Cryptocurrency symbol
    market_cap: float  # Market capitalization
    volume_24h: float  # Trading volume in the last 24 hours
    price_change_24h: float  # Price change percentage in the last 24 hours
    timestamp: datetime  # Last updated timestamp
    
@dataclass
class CoinInfo:
    symbol: str  # Cryptocurrency symbol
    name: str  # Name of the cryptocurrency
    description: str  # Description of the cryptocurrency
    website: str  # Official website URL
    github: str  # GitHub repository URL
    twitter: str  # Twitter handle
    reddit: str  # Reddit community URL
    last_updated: datetime  # Last updated timestamp 