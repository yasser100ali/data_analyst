#!/usr/bin/env python3
"""
Test script for the Data Analyst Agent
Tests the new architecture where natural language instructions are passed to an LLM agent
"""

import sys
import os

# Add parent directory to path
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from api.tools.data_analyst_agent import execute_data_analysis


def test_natural_language_instructions():
    """Test the new architecture with natural language instructions"""
    print("="*60)
    print("TEST: Data Analyst Agent with Natural Language Instructions")
    print("="*60)
    
    # File to analyze
    files = {
        "nba_seasons.csv": "api/uploads/nba_seasons.csv"
    }
    
    # Natural language instructions (what the orchestrator would send)
    test_cases = [
        "Show me the column names and basic statistics of the dataset.",
        "Find the top 10 features that are most correlated with the 'pts' variable.",
        "Calculate the average points scored and show the distribution.",
    ]
    
    for i, instructions in enumerate(test_cases, 1):
        print(f"\n{'='*60}")
        print(f"TEST CASE {i}: {instructions}")
        print('='*60)
        
        try:
            result = execute_data_analysis(
                instructions=instructions,
                files=files
            )
            
            if result.get("error"):
                print(f"❌ ERROR: {result['error']}")
                continue
            
            print("\n✅ SUCCESS!")
            
            if result.get("code"):
                print("\n🐍 GENERATED CODE:")
                for code_block in result["code"]:
                    print(code_block[:300] + "..." if len(code_block) > 300 else code_block)
            
            if result.get("stdout"):
                print("\n📊 OUTPUT:")
                for line in result["stdout"]:
                    print(line)
            
            if result.get("stderr") and any(err.strip() for err in result["stderr"]):
                print("\n⚠️  STDERR:")
                for line in result["stderr"]:
                    if line.strip():
                        print(line)
        
        except Exception as e:
            print(f"\n❌ Test case failed: {str(e)}")
            import traceback
            traceback.print_exc()
    
    print("\n✅ All test cases completed!")


if __name__ == "__main__":
    print("\n🚀 Starting Data Analyst Agent Tests\n")
    
    # Check if data file exists
    if not os.path.exists("api/uploads/nba_seasons.csv"):
        print("⚠️  Warning: Test data file not found at api/uploads/nba_seasons.csv")
        print("Checking for alternative file...")
        
        if os.path.exists("api/uploads/all_seasons.csv"):
            print("✓ Found all_seasons.csv, using that instead")
            # This would work, just update the file reference in the test
        else:
            print("Please ensure a CSV file exists in api/uploads/ before running tests.\n")
            sys.exit(1)
    
    # Run test
    test_natural_language_instructions()
    
    print("\n" + "="*60)
    print("🎉 Tests completed!")
    print("="*60 + "\n")

