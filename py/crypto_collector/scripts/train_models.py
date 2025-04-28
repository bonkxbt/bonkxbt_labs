import pandas as pd
from models.price_predictor import PricePredictor
from models.sentiment_analyzer import SentimentAnalyzer
from models.pattern_recognizer import PatternRecognizer
from database.db_handler import DatabaseHandler

def train_price_predictor(db_handler: DatabaseHandler, symbol: str):
    """Train price prediction model for a specific cryptocurrency"""
    # Get historical data for the specified cryptocurrency
    historical_data = db_handler.get_historical_data(
        symbol=symbol,
        start_date=pd.Timestamp.now() - pd.Timedelta(days=365),
        end_date=pd.Timestamp.now()
    )
    
    # Prepare training data
    price_data = pd.DataFrame(historical_data['prices'])
    
    # Initialize and train the price prediction model
    predictor = PricePredictor()
    history = predictor.train(price_data)
    
    return predictor, history  # Return the trained model and training history

def analyze_market_sentiment(db_handler: DatabaseHandler):
    """Analyze market sentiment using recent data"""
    # Get recent market data
    recent_data = db_handler.get_latest_market_data()
    
    # Initialize sentiment analyzer
    analyzer = SentimentAnalyzer()
    
    # Analyze sentiment based on recent data
    sentiment = analyzer.analyze_market_data(recent_data)
    
    return sentiment  # Return the analyzed sentiment

def identify_patterns(db_handler: DatabaseHandler, symbol: str):
    """Identify technical patterns for a specific cryptocurrency"""
    # Get recent price data for the specified cryptocurrency
    price_data = db_handler.get_recent_price_data(symbol)
    
    # Initialize pattern recognizer
    recognizer = PatternRecognizer()
    
    # Identify patterns in the price data
    patterns = recognizer.identify_patterns(price_data)
    clusters = recognizer.cluster_price_movements(price_data)
    
    return patterns, clusters  # Return identified patterns and clusters

def main():
    db_handler = DatabaseHandler()
    
    # Train models for each supported cryptocurrency
    for symbol in ['BTC', 'ETH', 'BNB']:
        print(f"Training model for {symbol}...")
        predictor, history = train_price_predictor(db_handler, symbol)
        print(f"Training completed. Final loss: {history.history['loss'][-1]}")
        
        # Save the trained model
        predictor.model.save(f'models/{symbol}_model.h5')
        
    # Analyze market sentiment
    print("Analyzing market sentiment...")
    sentiment = analyze_market_sentiment(db_handler)
    print("Overall market sentiment:", sentiment)
    
    # Identify patterns for each cryptocurrency
    print("Identifying patterns...")
    for symbol in ['BTC', 'ETH', 'BNB']:
        patterns, clusters = identify_patterns(db_handler, symbol)
        print(f"\nPatterns found for {symbol}:", patterns)
        print(f"Price movement clusters for {symbol}:", clusters)

if __name__ == "__main__":
    main() 