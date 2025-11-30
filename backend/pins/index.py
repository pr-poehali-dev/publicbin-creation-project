'''
Business: API for managing pins - create, list, like pins
Args: event with httpMethod, body, queryStringParameters; context with request_id
Returns: HTTP response with statusCode, headers, body
'''
import json
import os
from typing import Dict, Any, Optional
import psycopg2
from psycopg2.extras import RealDictCursor

def get_db_connection():
    """Get database connection using DATABASE_URL"""
    database_url = os.environ.get('DATABASE_URL')
    return psycopg2.connect(database_url, cursor_factory=RealDictCursor)

def get_client_ip(event: Dict[str, Any]) -> str:
    """Extract client IP from event"""
    headers = event.get('headers', {})
    return headers.get('x-forwarded-for', headers.get('x-real-ip', 'unknown')).split(',')[0].strip()

def handler(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    method: str = event.get('httpMethod', 'GET')
    
    # Handle CORS OPTIONS request
    if method == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type, X-User-Id, X-Auth-Token',
                'Access-Control-Max-Age': '86400'
            },
            'body': '',
            'isBase64Encoded': False
        }
    
    conn = get_db_connection()
    cursor = conn.cursor()
    
    try:
        if method == 'GET':
            # Get all pins ordered by creation date (newest first)
            cursor.execute(
                "SELECT id, content, created_at, likes_count FROM pins ORDER BY created_at DESC"
            )
            pins = cursor.fetchall()
            
            return {
                'statusCode': 200,
                'headers': {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                },
                'body': json.dumps([dict(pin) for pin in pins], default=str),
                'isBase64Encoded': False
            }
        
        elif method == 'POST':
            body_data = json.loads(event.get('body', '{}'))
            action = body_data.get('action', 'create')
            
            if action == 'create':
                # Create new pin
                content = body_data.get('content', '')
                if not content or len(content.strip()) == 0:
                    return {
                        'statusCode': 400,
                        'headers': {
                            'Content-Type': 'application/json',
                            'Access-Control-Allow-Origin': '*'
                        },
                        'body': json.dumps({'error': 'Content is required'}),
                        'isBase64Encoded': False
                    }
                
                cursor.execute(
                    "INSERT INTO pins (content, likes_count) VALUES (%s, 0) RETURNING id, content, created_at, likes_count",
                    (content,)
                )
                new_pin = cursor.fetchone()
                conn.commit()
                
                return {
                    'statusCode': 201,
                    'headers': {
                        'Content-Type': 'application/json',
                        'Access-Control-Allow-Origin': '*'
                    },
                    'body': json.dumps(dict(new_pin), default=str),
                    'isBase64Encoded': False
                }
            
            elif action == 'like':
                # Toggle like on a pin
                pin_id = body_data.get('pin_id')
                if not pin_id:
                    return {
                        'statusCode': 400,
                        'headers': {
                            'Content-Type': 'application/json',
                            'Access-Control-Allow-Origin': '*'
                        },
                        'body': json.dumps({'error': 'Pin ID is required'}),
                        'isBase64Encoded': False
                    }
                
                client_ip = get_client_ip(event)
                
                # Check if already liked
                cursor.execute(
                    "SELECT id FROM likes WHERE pin_id = %s AND ip_address = %s",
                    (pin_id, client_ip)
                )
                existing_like = cursor.fetchone()
                
                if existing_like:
                    # Unlike: remove like and decrement counter
                    cursor.execute(
                        "DELETE FROM likes WHERE pin_id = %s AND ip_address = %s",
                        (pin_id, client_ip)
                    )
                    cursor.execute(
                        "UPDATE pins SET likes_count = likes_count - 1 WHERE id = %s RETURNING likes_count",
                        (pin_id,)
                    )
                    result = cursor.fetchone()
                    conn.commit()
                    
                    return {
                        'statusCode': 200,
                        'headers': {
                            'Content-Type': 'application/json',
                            'Access-Control-Allow-Origin': '*'
                        },
                        'body': json.dumps({'liked': False, 'likes_count': result['likes_count']}),
                        'isBase64Encoded': False
                    }
                else:
                    # Like: add like and increment counter
                    cursor.execute(
                        "INSERT INTO likes (pin_id, ip_address) VALUES (%s, %s)",
                        (pin_id, client_ip)
                    )
                    cursor.execute(
                        "UPDATE pins SET likes_count = likes_count + 1 WHERE id = %s RETURNING likes_count",
                        (pin_id,)
                    )
                    result = cursor.fetchone()
                    conn.commit()
                    
                    return {
                        'statusCode': 200,
                        'headers': {
                            'Content-Type': 'application/json',
                            'Access-Control-Allow-Origin': '*'
                        },
                        'body': json.dumps({'liked': True, 'likes_count': result['likes_count']}),
                        'isBase64Encoded': False
                    }
        
        return {
            'statusCode': 405,
            'headers': {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            'body': json.dumps({'error': 'Method not allowed'}),
            'isBase64Encoded': False
        }
    
    finally:
        cursor.close()
        conn.close()
