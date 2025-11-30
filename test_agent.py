#!/usr/bin/env python3
"""
Test script for the Data Analyst Agent
"""

import sys
import os

# Add parent directory to path
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from api.tools.data_analyst_agent import DataAnalystAgent


def test_local_file():
    """Test with a local CSV file"""
    print("="*60)
    print("TEST 1: Analyzing Local File")
    print("="*60)
    
    agent = DataAnalystAgent()
    
    # Initialize with local file
    files = {
        "all_seasons.csv": "api/uploads/all_seasons.csv"
    }
    
    try:
        agent.initialize_session(files)
        
        # Run analysis
        queries = [
            "What are the column names in this dataset?",
            "What is the average points (pts) scored per player?",
            "Who are the top 5 players with the highest points per game?",
        ]
        
        for query in queries:
            print(f"\n{'='*60}")
            print(f"QUERY: {query}")
            print('='*60)
            
            result = agent.analyze(query)
            
            if result.get("error"):
                print(f"❌ ERROR: {result['error']}")
                continue
            
            print("\n📝 RESPONSE:")
            print(result.get("response", "No response"))
            
            if result.get("stdout"):
                print("\n📊 OUTPUT:")
                for line in result["stdout"]:
                    print(line)
            
            if result.get("stderr"):
                print("\n⚠️  STDERR:")
                for line in result["stderr"]:
                    if line.strip():
                        print(line)
        
        agent.close()
        print("\n✅ Test completed successfully!")
        
    except Exception as e:
        print(f"\n❌ Test failed: {str(e)}")
        import traceback
        traceback.print_exc()
        agent.close()


def test_blob_file():
    """Test with a blob URL (simulated)"""
    print("\n" + "="*60)
    print("TEST 2: Analyzing Blob URL File")
    print("="*60)
    
    agent = DataAnalystAgent()
    
    # For this test, we'll use a local file but treat it as if it's a blob
    # In production, this would be a real Vercel Blob URL
    files = {
        "data.csv": "api/uploads/all_seasons.csv"  # Replace with actual blob URL in production
    }
    
    try:
        agent.initialize_session(files)
        
        query = "Provide a summary of the dataset including shape, columns, and data types."
        
        print(f"\nQUERY: {query}\n")
        
        result = agent.analyze(query)
        
        if result.get("error"):
            print(f"❌ ERROR: {result['error']}")
        else:
            print("📝 RESPONSE:")
            print(result.get("response", "No response"))
            
            if result.get("stdout"):
                print("\n📊 OUTPUT:")
                print("\n".join(result["stdout"]))
        
        agent.close()
        print("\n✅ Test completed!")
        
    except Exception as e:
        print(f"\n❌ Test failed: {str(e)}")
        agent.close()


if __name__ == "__main__":
    print("\n🚀 Starting Data Analyst Agent Tests\n")
    
    # Check if data file exists
    if not os.path.exists("api/uploads/all_seasons.csv"):
        print("⚠️  Warning: Test data file not found at api/uploads/all_seasons.csv")
        print("Please ensure the file exists before running tests.\n")
        sys.exit(1)
    
    # Run tests
    test_local_file()
    # test_blob_file()  # Uncomment to test blob URLs
    
    print("\n" + "="*60)
    print("🎉 All tests completed!")
    print("="*60 + "\n")

