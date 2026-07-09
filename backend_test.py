#!/usr/bin/env python3
"""
Backend API Test Suite for RoseUp Quest 2026 (Phase 1)
Tests all endpoints against the external base URL
"""

import requests
import json
import sys
from typing import Dict, Any

# Base URL from .env NEXT_PUBLIC_LOCAL_URL
LOCAL_URL = "https://hope-steps.preview.emergentagent.com/api"
# Fallback to local if external fails
LOCAL_URL = "http://localhost:3000/api"

class Colors:
    GREEN = '\033[92m'
    RED = '\033[91m'
    YELLOW = '\033[93m'
    BLUE = '\033[94m'
    END = '\033[0m'

def log_test(test_name: str, status: str, details: str = ""):
    """Log test results with color coding"""
    color = Colors.GREEN if status == "PASS" else Colors.RED if status == "FAIL" else Colors.YELLOW
    print(f"{color}[{status}]{Colors.END} {test_name}")
    if details:
        print(f"  → {details}")

def test_healthcheck():
    """Test 1: GET /api/ → should return {ok:true, service:'RoseUp Quest 2026'}"""
    try:
        response = requests.get(f"{LOCAL_URL}", timeout=30)
        data = response.json()
        
        if response.status_code == 200 and data.get('ok') == True and data.get('service') == 'RoseUp Quest 2026':
            log_test("GET /api/ (healthcheck)", "PASS", f"Response: {data}")
            return True
        else:
            log_test("GET /api/ (healthcheck)", "FAIL", f"Status: {response.status_code}, Data: {data}")
            return False
    except Exception as e:
        log_test("GET /api/ (healthcheck)", "FAIL", f"Exception: {str(e)}")
        return False

def test_stats_initial():
    """Test 2: GET /api/stats → returns aggregated stats with >=10 participants after seed"""
    try:
        response = requests.get(f"{LOCAL_URL}/stats", timeout=30)
        data = response.json()
        
        required_fields = ['totalPoints', 'totalKm', 'totalParticipants', 'totalDonations', 'fundGoal', 'topParticipants']
        missing_fields = [f for f in required_fields if f not in data]
        
        if missing_fields:
            log_test("GET /api/stats (initial)", "FAIL", f"Missing fields: {missing_fields}")
            return False, None
        
        if data['fundGoal'] != 250000:
            log_test("GET /api/stats (initial)", "FAIL", f"fundGoal should be 250000, got {data['fundGoal']}")
            return False, None
        
        if data['totalParticipants'] < 10:
            log_test("GET /api/stats (initial)", "FAIL", f"Expected >=10 participants after seed, got {data['totalParticipants']}")
            return False, None
        
        if len(data['topParticipants']) != 3:
            log_test("GET /api/stats (initial)", "FAIL", f"Expected 3 top participants, got {len(data['topParticipants'])}")
            return False, None
        
        # Verify top participants have required fields
        for i, p in enumerate(data['topParticipants']):
            required_p_fields = ['id', 'name', 'avatar', 'points']
            missing_p_fields = [f for f in required_p_fields if f not in p]
            if missing_p_fields:
                log_test("GET /api/stats (initial)", "FAIL", f"Top participant {i} missing fields: {missing_p_fields}")
                return False, None
        
        # Verify sorted by points desc
        points = [p['points'] for p in data['topParticipants']]
        if points != sorted(points, reverse=True):
            log_test("GET /api/stats (initial)", "FAIL", f"Top participants not sorted by points desc: {points}")
            return False, None
        
        log_test("GET /api/stats (initial)", "PASS", 
                f"totalParticipants={data['totalParticipants']}, totalPoints={data['totalPoints']}, fundGoal={data['fundGoal']}")
        return True, data
    except Exception as e:
        log_test("GET /api/stats (initial)", "FAIL", f"Exception: {str(e)}")
        return False, None

def test_create_participant():
    """Test 3: POST /api/participants body {name, avatar} → returns full doc with UUID"""
    try:
        payload = {"name": "Elena Martinez", "avatar": "🌹"}
        response = requests.post(f"{LOCAL_URL}/participants", json=payload, timeout=30)
        data = response.json()
        
        if response.status_code != 200:
            log_test("POST /api/participants", "FAIL", f"Status: {response.status_code}, Data: {data}")
            return False, None
        
        required_fields = ['id', 'name', 'avatar', 'points', 'km', 'streak', 'completed', 'completedChallengeIds']
        missing_fields = [f for f in required_fields if f not in data]
        
        if missing_fields:
            log_test("POST /api/participants", "FAIL", f"Missing fields: {missing_fields}")
            return False, None
        
        if data['name'] != "Elena Martinez" or data['avatar'] != "🌹":
            log_test("POST /api/participants", "FAIL", f"Name/avatar mismatch: {data}")
            return False, None
        
        if data['points'] != 0 or data['km'] != 0 or data['completed'] != 0:
            log_test("POST /api/participants", "FAIL", f"Initial values should be 0: points={data['points']}, km={data['km']}, completed={data['completed']}")
            return False, None
        
        if not isinstance(data['completedChallengeIds'], list) or len(data['completedChallengeIds']) != 0:
            log_test("POST /api/participants", "FAIL", f"completedChallengeIds should be empty array: {data['completedChallengeIds']}")
            return False, None
        
        # Verify UUID format (basic check)
        if not data['id'] or len(data['id']) < 32:
            log_test("POST /api/participants", "FAIL", f"Invalid UUID: {data['id']}")
            return False, None
        
        # Verify no _id field
        if '_id' in data:
            log_test("POST /api/participants", "FAIL", f"Response should not contain _id field")
            return False, None
        
        log_test("POST /api/participants", "PASS", f"Created participant with id={data['id']}")
        return True, data
    except Exception as e:
        log_test("POST /api/participants", "FAIL", f"Exception: {str(e)}")
        return False, None

def test_get_participant(participant_id: str):
    """Test 4: GET /api/participants/{id} → returns the created doc"""
    try:
        response = requests.get(f"{LOCAL_URL}/participants/{participant_id}", timeout=30)
        data = response.json()
        
        if response.status_code != 200:
            log_test(f"GET /api/participants/{participant_id}", "FAIL", f"Status: {response.status_code}, Data: {data}")
            return False
        
        if data['id'] != participant_id:
            log_test(f"GET /api/participants/{participant_id}", "FAIL", f"ID mismatch: expected {participant_id}, got {data['id']}")
            return False
        
        # Verify no _id field
        if '_id' in data:
            log_test(f"GET /api/participants/{participant_id}", "FAIL", f"Response should not contain _id field")
            return False
        
        log_test(f"GET /api/participants/{participant_id}", "PASS", f"Retrieved participant: {data['name']}")
        return True
    except Exception as e:
        log_test(f"GET /api/participants/{participant_id}", "FAIL", f"Exception: {str(e)}")
        return False

def test_get_participant_404():
    """Test 4b: GET /api/participants/{bogus_id} → returns 404"""
    try:
        bogus_id = "bogus-id-12345"
        response = requests.get(f"{LOCAL_URL}/participants/{bogus_id}", timeout=30)
        
        if response.status_code == 404:
            log_test(f"GET /api/participants/{bogus_id} (404 test)", "PASS", "Correctly returned 404 for non-existent participant")
            return True
        else:
            log_test(f"GET /api/participants/{bogus_id} (404 test)", "FAIL", f"Expected 404, got {response.status_code}")
            return False
    except Exception as e:
        log_test(f"GET /api/participants/{bogus_id} (404 test)", "FAIL", f"Exception: {str(e)}")
        return False

def test_get_daily_challenges(user_id: str):
    """Test 5: GET /api/challenges/daily?userId={id} → returns 5 challenges"""
    try:
        response = requests.get(f"{LOCAL_URL}/challenges/daily?userId={user_id}", timeout=30)
        data = response.json()
        
        if response.status_code != 200:
            log_test(f"GET /api/challenges/daily?userId={user_id}", "FAIL", f"Status: {response.status_code}, Data: {data}")
            return False, None
        
        if 'challenges' not in data:
            log_test(f"GET /api/challenges/daily?userId={user_id}", "FAIL", f"Missing 'challenges' field: {data}")
            return False, None
        
        challenges = data['challenges']
        if len(challenges) != 5:
            log_test(f"GET /api/challenges/daily?userId={user_id}", "FAIL", f"Expected 5 challenges, got {len(challenges)}")
            return False, None
        
        # Verify each challenge has required fields
        for i, c in enumerate(challenges):
            required_fields = ['id', 'title', 'description', 'icon', 'points', 'category', 'completed']
            missing_fields = [f for f in required_fields if f not in c]
            if missing_fields:
                log_test(f"GET /api/challenges/daily?userId={user_id}", "FAIL", f"Challenge {i} missing fields: {missing_fields}")
                return False, None
            
            if c['completed'] != False:
                log_test(f"GET /api/challenges/daily?userId={user_id}", "FAIL", f"Challenge {i} should have completed=false initially, got {c['completed']}")
                return False, None
        
        log_test(f"GET /api/challenges/daily?userId={user_id}", "PASS", f"Retrieved 5 challenges, all marked completed=false")
        return True, challenges
    except Exception as e:
        log_test(f"GET /api/challenges/daily?userId={user_id}", "FAIL", f"Exception: {str(e)}")
        return False, None

def test_complete_challenge(user_id: str, challenge_id: str, points: int, km: float):
    """Test 6: POST /api/challenges/complete → awards points and km"""
    try:
        payload = {
            "userId": user_id,
            "challengeId": challenge_id,
            "points": points,
            "km": km
        }
        response = requests.post(f"{LOCAL_URL}/challenges/complete", json=payload, timeout=30)
        data = response.json()
        
        if response.status_code != 200:
            log_test(f"POST /api/challenges/complete (first time)", "FAIL", f"Status: {response.status_code}, Data: {data}")
            return False, None
        
        if not data.get('ok'):
            log_test(f"POST /api/challenges/complete (first time)", "FAIL", f"Expected ok=true, got {data}")
            return False, None
        
        if 'participant' not in data:
            log_test(f"POST /api/challenges/complete (first time)", "FAIL", f"Missing 'participant' field: {data}")
            return False, None
        
        participant = data['participant']
        
        # Verify points and km increased
        if participant['points'] < points:
            log_test(f"POST /api/challenges/complete (first time)", "FAIL", f"Points should be at least {points}, got {participant['points']}")
            return False, None
        
        if participant['km'] < km:
            log_test(f"POST /api/challenges/complete (first time)", "FAIL", f"Km should be at least {km}, got {participant['km']}")
            return False, None
        
        # Verify completed count incremented
        if participant['completed'] < 1:
            log_test(f"POST /api/challenges/complete (first time)", "FAIL", f"Completed count should be at least 1, got {participant['completed']}")
            return False, None
        
        # Verify challengeId in completedChallengeIds
        if challenge_id not in participant['completedChallengeIds']:
            log_test(f"POST /api/challenges/complete (first time)", "FAIL", f"challengeId {challenge_id} not in completedChallengeIds: {participant['completedChallengeIds']}")
            return False, None
        
        log_test(f"POST /api/challenges/complete (first time)", "PASS", 
                f"Challenge completed: points={participant['points']}, km={participant['km']}, completed={participant['completed']}")
        return True, participant
    except Exception as e:
        log_test(f"POST /api/challenges/complete (first time)", "FAIL", f"Exception: {str(e)}")
        return False, None

def test_complete_challenge_idempotency(user_id: str, challenge_id: str, points: int, km: float, previous_participant: Dict[str, Any]):
    """Test 6b: POST /api/challenges/complete (idempotency) → should not double-count"""
    try:
        payload = {
            "userId": user_id,
            "challengeId": challenge_id,
            "points": points,
            "km": km
        }
        response = requests.post(f"{LOCAL_URL}/challenges/complete", json=payload, timeout=30)
        data = response.json()
        
        if response.status_code != 200:
            log_test(f"POST /api/challenges/complete (idempotency)", "FAIL", f"Status: {response.status_code}, Data: {data}")
            return False
        
        if not data.get('ok'):
            log_test(f"POST /api/challenges/complete (idempotency)", "FAIL", f"Expected ok=true, got {data}")
            return False
        
        if not data.get('alreadyCompleted'):
            log_test(f"POST /api/challenges/complete (idempotency)", "FAIL", f"Expected alreadyCompleted=true, got {data}")
            return False
        
        # Verify points/km/completed did NOT increase
        if 'participant' in data:
            participant = data['participant']
            if participant['points'] != previous_participant['points']:
                log_test(f"POST /api/challenges/complete (idempotency)", "FAIL", 
                        f"Points should not change: was {previous_participant['points']}, now {participant['points']}")
                return False
            
            if participant['km'] != previous_participant['km']:
                log_test(f"POST /api/challenges/complete (idempotency)", "FAIL", 
                        f"Km should not change: was {previous_participant['km']}, now {participant['km']}")
                return False
            
            if participant['completed'] != previous_participant['completed']:
                log_test(f"POST /api/challenges/complete (idempotency)", "FAIL", 
                        f"Completed count should not change: was {previous_participant['completed']}, now {participant['completed']}")
                return False
        
        log_test(f"POST /api/challenges/complete (idempotency)", "PASS", 
                "Correctly returned alreadyCompleted=true without double-counting")
        return True
    except Exception as e:
        log_test(f"POST /api/challenges/complete (idempotency)", "FAIL", f"Exception: {str(e)}")
        return False

def test_daily_challenges_after_completion(user_id: str, completed_challenge_id: str):
    """Test 7: GET /api/challenges/daily?userId={id} after completion → completed challenge should have completed=true"""
    try:
        response = requests.get(f"{LOCAL_URL}/challenges/daily?userId={user_id}", timeout=30)
        data = response.json()
        
        if response.status_code != 200:
            log_test(f"GET /api/challenges/daily after completion", "FAIL", f"Status: {response.status_code}, Data: {data}")
            return False
        
        challenges = data.get('challenges', [])
        completed_challenge = next((c for c in challenges if c['id'] == completed_challenge_id), None)
        
        if not completed_challenge:
            log_test(f"GET /api/challenges/daily after completion", "FAIL", f"Completed challenge {completed_challenge_id} not found in daily challenges")
            return False
        
        if completed_challenge['completed'] != True:
            log_test(f"GET /api/challenges/daily after completion", "FAIL", 
                    f"Challenge {completed_challenge_id} should have completed=true, got {completed_challenge['completed']}")
            return False
        
        log_test(f"GET /api/challenges/daily after completion", "PASS", 
                f"Challenge {completed_challenge_id} correctly marked as completed=true")
        return True
    except Exception as e:
        log_test(f"GET /api/challenges/daily after completion", "FAIL", f"Exception: {str(e)}")
        return False

def test_leaderboard():
    """Test 8: GET /api/leaderboard → returns ranked list sorted by points desc"""
    try:
        response = requests.get(f"{LOCAL_URL}/leaderboard", timeout=30)
        data = response.json()
        
        if response.status_code != 200:
            log_test(f"GET /api/leaderboard", "FAIL", f"Status: {response.status_code}, Data: {data}")
            return False
        
        if 'leaderboard' not in data:
            log_test(f"GET /api/leaderboard", "FAIL", f"Missing 'leaderboard' field: {data}")
            return False
        
        leaderboard = data['leaderboard']
        
        if len(leaderboard) == 0:
            log_test(f"GET /api/leaderboard", "FAIL", f"Leaderboard is empty")
            return False
        
        # Verify sorted by points desc
        points = [p['points'] for p in leaderboard]
        if points != sorted(points, reverse=True):
            log_test(f"GET /api/leaderboard", "FAIL", f"Leaderboard not sorted by points desc")
            return False
        
        # Verify rank field starts at 1
        if leaderboard[0]['rank'] != 1:
            log_test(f"GET /api/leaderboard", "FAIL", f"First rank should be 1, got {leaderboard[0]['rank']}")
            return False
        
        # Verify ranks are sequential
        for i, p in enumerate(leaderboard):
            if p['rank'] != i + 1:
                log_test(f"GET /api/leaderboard", "FAIL", f"Rank at position {i} should be {i+1}, got {p['rank']}")
                return False
        
        log_test(f"GET /api/leaderboard", "PASS", f"Retrieved {len(leaderboard)} participants, correctly ranked")
        return True
    except Exception as e:
        log_test(f"GET /api/leaderboard", "FAIL", f"Exception: {str(e)}")
        return False

def test_leaderboard_search():
    """Test 9: GET /api/leaderboard?q=camille → returns Camille Dubois (case-insensitive)"""
    try:
        response = requests.get(f"{LOCAL_URL}/leaderboard?q=camille", timeout=30)
        data = response.json()
        
        if response.status_code != 200:
            log_test(f"GET /api/leaderboard?q=camille", "FAIL", f"Status: {response.status_code}, Data: {data}")
            return False
        
        if 'leaderboard' not in data:
            log_test(f"GET /api/leaderboard?q=camille", "FAIL", f"Missing 'leaderboard' field: {data}")
            return False
        
        leaderboard = data['leaderboard']
        
        # Find Camille Dubois (case-insensitive)
        camille = next((p for p in leaderboard if 'camille' in p['name'].lower()), None)
        
        if not camille:
            log_test(f"GET /api/leaderboard?q=camille", "FAIL", f"Camille Dubois not found in search results")
            return False
        
        log_test(f"GET /api/leaderboard?q=camille", "PASS", f"Found {camille['name']} with {camille['points']} points")
        return True
    except Exception as e:
        log_test(f"GET /api/leaderboard?q=camille", "FAIL", f"Exception: {str(e)}")
        return False

def test_stats_after_completion(initial_stats: Dict[str, Any]):
    """Test 10: GET /api/stats after completing a challenge → totalPoints should have increased"""
    try:
        response = requests.get(f"{LOCAL_URL}/stats", timeout=30)
        data = response.json()
        
        if response.status_code != 200:
            log_test(f"GET /api/stats (after completion)", "FAIL", f"Status: {response.status_code}, Data: {data}")
            return False
        
        if data['totalPoints'] <= initial_stats['totalPoints']:
            log_test(f"GET /api/stats (after completion)", "FAIL", 
                    f"totalPoints should have increased: was {initial_stats['totalPoints']}, now {data['totalPoints']}")
            return False
        
        log_test(f"GET /api/stats (after completion)", "PASS", 
                f"totalPoints increased from {initial_stats['totalPoints']} to {data['totalPoints']}")
        return True
    except Exception as e:
        log_test(f"GET /api/stats (after completion)", "FAIL", f"Exception: {str(e)}")
        return False

def main():
    """Run all backend tests in sequence"""
    print(f"\n{Colors.BLUE}{'='*80}{Colors.END}")
    print(f"{Colors.BLUE}RoseUp Quest 2026 - Backend API Test Suite{Colors.END}")
    print(f"{Colors.BLUE}Base URL: {LOCAL_URL}{Colors.END}")
    print(f"{Colors.BLUE}{'='*80}{Colors.END}\n")
    
    results = []
    
    # Test 1: Healthcheck
    results.append(test_healthcheck())
    
    # Test 2: Initial stats
    stats_pass, initial_stats = test_stats_initial()
    results.append(stats_pass)
    
    # Test 3: Create participant
    create_pass, participant = test_create_participant()
    results.append(create_pass)
    
    if not create_pass or not participant:
        print(f"\n{Colors.RED}Cannot continue tests without a valid participant{Colors.END}")
        sys.exit(1)
    
    participant_id = participant['id']
    
    # Test 4: Get participant by ID
    results.append(test_get_participant(participant_id))
    
    # Test 4b: Get participant with bogus ID (404)
    results.append(test_get_participant_404())
    
    # Test 5: Get daily challenges
    challenges_pass, challenges = test_get_daily_challenges(participant_id)
    results.append(challenges_pass)
    
    if not challenges_pass or not challenges:
        print(f"\n{Colors.RED}Cannot continue tests without valid challenges{Colors.END}")
        sys.exit(1)
    
    # Test 6: Complete a challenge
    first_challenge = challenges[0]
    complete_pass, updated_participant = test_complete_challenge(
        participant_id, 
        first_challenge['id'], 
        first_challenge['points'], 
        3.0  # km
    )
    results.append(complete_pass)
    
    if not complete_pass or not updated_participant:
        print(f"\n{Colors.RED}Cannot continue idempotency test without successful completion{Colors.END}")
    else:
        # Test 6b: Idempotency - complete same challenge again
        results.append(test_complete_challenge_idempotency(
            participant_id,
            first_challenge['id'],
            first_challenge['points'],
            3.0,
            updated_participant
        ))
        
        # Test 7: Get daily challenges after completion
        results.append(test_daily_challenges_after_completion(participant_id, first_challenge['id']))
    
    # Test 8: Leaderboard
    results.append(test_leaderboard())
    
    # Test 9: Leaderboard search
    results.append(test_leaderboard_search())
    
    # Test 10: Stats after completion
    if initial_stats:
        results.append(test_stats_after_completion(initial_stats))
    
    # Summary
    print(f"\n{Colors.BLUE}{'='*80}{Colors.END}")
    passed = sum(1 for r in results if r)
    total = len(results)
    color = Colors.GREEN if passed == total else Colors.RED
    print(f"{color}Test Results: {passed}/{total} passed{Colors.END}")
    print(f"{Colors.BLUE}{'='*80}{Colors.END}\n")
    
    sys.exit(0 if passed == total else 1)

if __name__ == "__main__":
    main()
