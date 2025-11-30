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
            # Get query parameters for search and sort
            query_params = event.get('queryStringParameters', {})
            pin_id = query_params.get('id')
            search = query_params.get('search', '')
            sort = query_params.get('sort', 'newest')
            
            if pin_id:
                # Get single pin with details
                cursor.execute(
                    "SELECT id, title, description, content, created_at, likes_count FROM t_p53620071_publicbin_creation_p.pins WHERE id = %s",
                    (pin_id,)
                )
                pin = cursor.fetchone()
                if not pin:
                    return {
                        'statusCode': 404,
                        'headers': {
                            'Content-Type': 'application/json',
                            'Access-Control-Allow-Origin': '*'
                        },
                        'body': json.dumps({'error': 'Pin not found'}),
                        'isBase64Encoded': False
                    }
                
                # Get comments for this pin
                cursor.execute(
                    "SELECT id, username, content, created_at FROM t_p53620071_publicbin_creation_p.comments WHERE pin_id = %s ORDER BY created_at ASC",
                    (pin_id,)
                )
                comments = cursor.fetchall()
                
                pin_dict = dict(pin)
                pin_dict['comments'] = [dict(c) for c in comments]
                
                return {
                    'statusCode': 200,
                    'headers': {
                        'Content-Type': 'application/json',
                        'Access-Control-Allow-Origin': '*'
                    },
                    'body': json.dumps(pin_dict, default=str),
                    'isBase64Encoded': False
                }
            
            # List all pins with search and sort
            query = "SELECT id, title, description, content, created_at, likes_count FROM t_p53620071_publicbin_creation_p.pins"
            conditions = []
            params = []
            
            if search:
                conditions.append("(title ILIKE %s OR description ILIKE %s OR content ILIKE %s)")
                search_pattern = f"%{search}%"
                params.extend([search_pattern, search_pattern, search_pattern])
            
            if conditions:
                query += " WHERE " + " AND ".join(conditions)
            
            if sort == 'oldest':
                query += " ORDER BY created_at ASC"
            else:
                query += " ORDER BY created_at DESC"
            
            cursor.execute(query, params if params else None)
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
                title = body_data.get('title', '').strip()
                description = body_data.get('description', '').strip()
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
                    "INSERT INTO t_p53620071_publicbin_creation_p.pins (title, description, content, likes_count) VALUES (%s, %s, %s, 0) RETURNING id, title, description, content, created_at, likes_count",
                    (title, description, content)
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
                    "SELECT id FROM t_p53620071_publicbin_creation_p.likes WHERE pin_id = %s AND ip_address = %s",
                    (pin_id, client_ip)
                )
                existing_like = cursor.fetchone()
                
                if existing_like:
                    # Unlike: remove like and decrement counter
                    cursor.execute(
                        "DELETE FROM t_p53620071_publicbin_creation_p.likes WHERE pin_id = %s AND ip_address = %s",
                        (pin_id, client_ip)
                    )
                    cursor.execute(
                        "UPDATE t_p53620071_publicbin_creation_p.pins SET likes_count = likes_count - 1 WHERE id = %s RETURNING likes_count",
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
                        "INSERT INTO t_p53620071_publicbin_creation_p.likes (pin_id, ip_address) VALUES (%s, %s)",
                        (pin_id, client_ip)
                    )
                    cursor.execute(
                        "UPDATE t_p53620071_publicbin_creation_p.pins SET likes_count = likes_count + 1 WHERE id = %s RETURNING likes_count",
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
            
            elif action == 'comment':
                # Add comment to a pin
                pin_id = body_data.get('pin_id')
                username = body_data.get('username', 'Anonymous').strip()
                comment_content = body_data.get('content', '').strip()
                
                if not pin_id or not comment_content:
                    return {
                        'statusCode': 400,
                        'headers': {
                            'Content-Type': 'application/json',
                            'Access-Control-Allow-Origin': '*'
                        },
                        'body': json.dumps({'error': 'Pin ID and content are required'}),
                        'isBase64Encoded': False
                    }
                
                cursor.execute(
                    "INSERT INTO t_p53620071_publicbin_creation_p.comments (pin_id, username, content) VALUES (%s, %s, %s) RETURNING id, username, content, created_at",
                    (pin_id, username, comment_content)
                )
                new_comment = cursor.fetchone()
                conn.commit()
                
                return {
                    'statusCode': 201,
                    'headers': {
                        'Content-Type': 'application/json',
                        'Access-Control-Allow-Origin': '*'
                    },
                    'body': json.dumps(dict(new_comment), default=str),
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