import re
import psycopg2
from psycopg2.extras import RealDictCursor
from dotenv import load_dotenv
import os

load_dotenv()

DB_NAME = os.getenv('DB_NAME')
DB_USER = os.getenv('DB_USER')
DB_PASSWORD = os.getenv('DB_PASSWORD')
DB_HOST = os.getenv('DB_HOST')
DB_PORT = os.getenv('DB_PORT')

ALLOWED_KEYWORDS = ['FOREIGN KEY', 'REFERENCES']

def get_connection():
    return psycopg2.connect(
        dbname=DB_NAME,
        user=DB_USER,
        password=DB_PASSWORD,
        host=DB_HOST,
        port=DB_PORT
    )

def safe_identifier(identifier):
    """
    Validate that the identifier (table or column name) contains only allowed characters.
    Allowed: letters, digits, and underscores; must not start with a digit.
    Raises ValueError if the identifier is unsafe.
    """
    for keyword in ALLOWED_KEYWORDS:
        if keyword in identifier:
            return identifier
    if not re.match(r'^[A-Za-z_][A-Za-z0-9_]*(\.[A-Za-z_][A-Za-z0-9_]*)*$', identifier):
        raise ValueError(f"Unsafe identifier: {identifier}")
    return identifier

def safe_identifier_with_alias(identifier):
    """
    Ensure the identifier with alias is safe to use in SQL queries.
    """
    parts = identifier.split(" AS ")
    if len(parts) == 2:
        return f"{safe_identifier(parts[0])} AS {safe_identifier(parts[1])}"
    return safe_identifier(identifier)

def build_where_clause(conditions):
    """
    Given a dictionary of conditions, build a SQL WHERE clause and a list of parameters.
    
    Example:
        conditions = {'id': 5, 'status': 'active'}
        returns ("WHERE id = %s AND status = %s", [5, 'active'])
    """
    if not conditions:
        return "", []
    clause_parts = []
    params = []
    for key, value in conditions.items():
        safe_key = safe_identifier(key)
        clause_parts.append(f"{safe_key} = %s")
        params.append(value)
    clause = " AND ".join(clause_parts)
    return f"WHERE {clause}", params

def dictfetchall(cursor):
    """
    Return all rows from a cursor as a list of dictionaries.
    """
    return cursor.fetchall()

def dictfetchone(cursor):
    """
    Return one row from a cursor as a dictionary.
    """
    return cursor.fetchone()

def test_connection():
    """
    Test the database connection.
    
    Returns:
      - True if the connection is successful.
      - False if the connection fails.
    """
    try:
        with get_connection() as conn:
            with conn.cursor() as cursor:
                cursor.execute("SELECT 1")
                cursor.fetchone()
        print(f"PostgreSQL connection successful | DB: {DB_NAME} | User: {DB_USER} |")
        return True
    except Exception as e:
        print(f"Connection test failed: {e}")
        return False

# --- Generalized CRUD Functions ---
def create_table(table_name, attributes):
    """
    Create a new table in the database.
    
    Parameters:
      - table_name (str): Name of the table.
      - attributes (dict): Dictionary of column names and their data types.
    
    Example:
      create_table('users', {'id': 'SERIAL PRIMARY KEY', 'username': 'VARCHAR(50)', 'password': 'VARCHAR(50)'})
    """
    table = safe_identifier(table_name)
    columns = ", ".join(f"{safe_identifier(col)} {dtype}" for col, dtype in attributes.items())
    query = f"CREATE TABLE IF NOT EXISTS {table} ({columns})"
    
    with get_connection() as conn:
        with conn.cursor() as cursor:
            cursor.execute(query)
            conn.commit()

def insert_record(table_name, attributes, values, returning_columns=None):
    """
    Insert a new row into the specified table.
    
    Parameters:
      - table_name (str): Name of the table.
      - attributes (list): List of column names.
      - values (list): List of corresponding values.
      - returning_columns (list, optional): List of columns to return (useful for PostgreSQL's RETURNING clause).
    
    Returns:
      - If returning_columns is provided, returns a list of dictionaries for the inserted row(s).
      - Otherwise, returns None.
    """
    if len(attributes) != len(values):
        raise ValueError("Attributes and values must have the same length.")

    table = safe_identifier(table_name)
    cols = ", ".join(safe_identifier(attr) for attr in attributes)
    placeholders = ", ".join(["%s"] * len(values))
    
    query = f"INSERT INTO {table} ({cols}) VALUES ({placeholders})"
    if returning_columns:
        ret_cols = ", ".join(safe_identifier(col) for col in returning_columns)
        query += f" RETURNING {ret_cols}"

    with get_connection() as conn:
        with conn.cursor(cursor_factory=RealDictCursor) as cursor:
            cursor.execute(query, values)
            if returning_columns:
                return dictfetchall(cursor)
    return None

def read_records(table_name, attributes=None, conditions=None):
    """
    Retrieve multiple rows from the specified table.
    
    Parameters:
      - table_name (str): Name of the table.
      - attributes (list, optional): List of columns to retrieve. If not provided, selects all columns (*).
      - conditions (dict, optional): A dictionary of conditions to build the WHERE clause.
    
    Returns:
      - A list of dictionaries representing the rows.
    """
    table = safe_identifier(table_name)
    select_clause = ", ".join(safe_identifier(attr) for attr in attributes) if attributes else "*"
    query = f"SELECT {select_clause} FROM {table} "
    
    where_clause, params = build_where_clause(conditions)
    query += where_clause

    with get_connection() as conn:
        with conn.cursor(cursor_factory=RealDictCursor) as cursor:
            cursor.execute(query, params)
            return dictfetchall(cursor)

def read_record(table_name, attributes=None, conditions=None):
    """
    Retrieve a single row from the specified table.
    
    Parameters:
      - table_name (str): Name of the table.
      - attributes (list, optional): List of columns to retrieve. If not provided, selects all columns.
      - conditions (dict, optional): Conditions for the WHERE clause.
    
    Returns:
      - A dictionary representing the row, or None if no row is found.
    """
    table = safe_identifier(table_name)
    select_clause = ", ".join(safe_identifier(attr) for attr in attributes) if attributes else "*"
    query = f"SELECT {select_clause} FROM {table} "
    
    where_clause, params = build_where_clause(conditions)
    query += where_clause

    with get_connection() as conn:
        with conn.cursor(cursor_factory=RealDictCursor) as cursor:
            cursor.execute(query, params)
            return dictfetchone(cursor)

def read_joined_records(tables, join_conditions, attributes=None, conditions=None):
    """
    Retrieve rows from multiple tables with join operations.
    
    Parameters:
      - tables (list): List of table names to join.
      - join_conditions (list): List of join conditions (e.g., ["table1.id = table2.store_id", "table2.id = table3.user_id"]).
      - attributes (list, optional): List of columns to retrieve. If not provided, selects all columns (*).
      - conditions (dict, optional): A dictionary of conditions to build the WHERE clause.
    
    Returns:
      - A list of dictionaries representing the joined rows.
    """
    tables = [safe_identifier(table) for table in tables]
    join_conditions = [condition.replace("=", " = ").replace(".", ".") for condition in join_conditions]
    
    select_clause = ", ".join(safe_identifier_with_alias(attr) for attr in attributes) if attributes else "*"
    query = f"SELECT {select_clause} FROM {tables[0]} "
    
    for i in range(1, len(tables)):
        query += f"JOIN {tables[i]} ON {join_conditions[i-1]} "
    
    where_clause, params = build_where_clause(conditions)
    query += where_clause

    with get_connection() as conn:
        with conn.cursor(cursor_factory=RealDictCursor) as cursor:
            cursor.execute(query, params)
            return dictfetchall(cursor)

def read_column(table_name, column_name, conditions=None):
    """
    Retrieve a specific column from the specified table.
    
    Parameters:
      - table_name (str): Name of the table.
      - column_name (str): Name of the column to retrieve.
      - conditions (dict, optional): A dictionary of conditions to build the WHERE clause.
    
    Returns:
      - A list of values from the specified column.
    """
    table = safe_identifier(table_name)
    column = safe_identifier(column_name)
    query = f"SELECT {column} FROM {table} "
    
    where_clause, params = build_where_clause(conditions)
    query += where_clause

    with get_connection() as conn:
        with conn.cursor() as cursor:
            cursor.execute(query, params)
            return [row[0] for row in cursor.fetchall()]

def read_by_page(table_name, page: int = 1, items_per_page: int = None, attributes=None, conditions=None):
    """
    Retrieve rows from the specified table, with optional pagination.
    
    Parameters:
      - table_name (str): Name of the table.
      - page (int): The page number to retrieve (starting from 1). Default is 1.
      - items_per_page (int, optional): Number of items per page. If not provided, all rows are returned.
      - attributes (list, optional): List of columns to retrieve. If not provided, selects all columns (*).
      - conditions (dict, optional): A dictionary of conditions to build the WHERE clause.
    
    Returns:
      - A list of dictionaries representing the rows for the requested page.
    
    Raises:
      - ValueError: If the page number is less than 1.
    """
    # Validate the page number
    if page < 1:
        raise ValueError("Page number must be at least 1")

    # Calculate the offset if pagination is enabled
    offset = (page - 1) * items_per_page if items_per_page is not None else None

    # Build the base query
    table = safe_identifier(table_name)
    select_clause = ", ".join(safe_identifier(attr) for attr in attributes) if attributes else "*"
    query = f"SELECT {select_clause} FROM {table} ORDER BY \"created_at\""
    
    # Add WHERE clause if conditions are provided
    where_clause, params = build_where_clause(conditions)
    query += where_clause

    # Add pagination if items_per_page is provided
    if items_per_page is not None:
        query += f" LIMIT {items_per_page}"
        if offset is not None:
            query += f" OFFSET {offset}"

    # Execute the query and return the results
    with get_connection() as conn:
        with conn.cursor(cursor_factory=RealDictCursor) as cursor:
            cursor.execute(query, params)
            return dictfetchall(cursor)

def update_record(table_name, attributes, values, conditions, returning_columns=None):
    """
    Update rows in the specified table.
    
    Parameters:
      - table_name (str): Name of the table.
      - attributes (list): List of columns to update.
      - values (list): List of new values corresponding to the attributes.
      - conditions (dict): Conditions to filter which rows to update.
      - returning_columns (list, optional): Columns to return after the update.
    
    Returns:
      - If returning_columns is provided, returns a list of dictionaries representing the updated row(s).
      - Otherwise, returns None.
    """
    if len(attributes) != len(values):
        raise ValueError("Attributes and values must have the same length.")

    table = safe_identifier(table_name)
    set_clause = ", ".join(f"{safe_identifier(attr)} = %s" for attr in attributes)
    query = f"UPDATE {table} SET {set_clause} "

    where_clause, condition_params = build_where_clause(conditions)
    query += where_clause

    params = values + condition_params
    if returning_columns:
        ret_cols = ", ".join(safe_identifier(col) for col in returning_columns)
        query += f" RETURNING {ret_cols}"

    with get_connection() as conn:
        with conn.cursor(cursor_factory=RealDictCursor) as cursor:
            cursor.execute(query, params)
            if returning_columns:
                return dictfetchall(cursor)
    return None

def delete_record(table_name, conditions, returning_columns=None):
    """
    Delete rows from the specified table.
    
    Parameters:
      - table_name (str): Name of the table.
      - conditions (dict): Conditions to identify which rows to delete.
      - returning_columns (list, optional): Columns to return from the deleted rows.
    
    Returns:
      - If returning_columns is provided, returns a list of dictionaries representing the deleted row(s).
      - Otherwise, returns None.
    """
    table = safe_identifier(table_name)
    query = f"DELETE FROM {table} "
    
    where_clause, params = build_where_clause(conditions)
    query += where_clause
    
    if returning_columns:
        ret_cols = ", ".join(safe_identifier(col) for col in returning_columns)
        query += f" RETURNING {ret_cols}"

    with get_connection() as conn:
        with conn.cursor(cursor_factory=RealDictCursor) as cursor:
            cursor.execute(query, params)
            if returning_columns:
                return dictfetchall(cursor)
    return None

def alter_table(table_name, action, column_name=None, column_type=None):
    """
    Alter the specified table in the database.
    
    Parameters:
      - table_name (str): Name of the table to alter.
      - action (str): The action to perform (e.g., 'ADD', 'DROP', 'ALTER').
      - column_name (str, optional): Name of the column to add, drop, or alter.
      - column_type (str, optional): Data type of the column to add or alter.
    
    Returns:
      - None
    """
    table = safe_identifier(table_name)
    if action.upper() not in ['ADD', 'DROP', 'ALTER']:
        raise ValueError("Invalid action. Must be 'ADD', 'DROP', or 'ALTER'.")

    if action.upper() == 'ADD':
        if not column_name or not column_type:
            raise ValueError("Column name and type must be provided for ADD action.")
        column = safe_identifier(column_name)
        query = f"ALTER TABLE {table} ADD COLUMN {column} {column_type}"
    elif action.upper() == 'DROP':
        if not column_name:
            raise ValueError("Column name must be provided for DROP action.")
        column = safe_identifier(column_name)
        query = f"ALTER TABLE {table} DROP COLUMN {column}"
    elif action.upper() == 'ALTER':
        if not column_name or not column_type:
            raise ValueError("Column name and new type must be provided for ALTER action.")
        column = safe_identifier(column_name)
        query = f"ALTER TABLE {table} ALTER COLUMN {column} TYPE {column_type}"

    with get_connection() as conn:
        with conn.cursor() as cursor:
            cursor.execute(query)
            conn.commit()

def get_table_schema(table_name):
    """
    Retrieve the schema of the specified table.
    
    Parameters:
      - table_name (str): Name of the table.
    
    Returns:
      - A dictionary where keys are column names and values are their data types.
    """
    table = safe_identifier(table_name)
    query = f"""
    SELECT column_name, data_type
    FROM information_schema.columns
    WHERE table_name = %s
    """
    
    with get_connection() as conn:
        with conn.cursor(cursor_factory=RealDictCursor) as cursor:
            cursor.execute(query, (table,))
            columns = cursor.fetchall()
    
    return {col['column_name']: col['data_type'] for col in columns}

def update_table_schema(table_name, new_attributes):
    """
    Update the schema of the specified table based on the new attributes.
    
    Parameters:
      - table_name (str): Name of the table.
      - new_attributes (dict): Dictionary of new column names and their data types.
    
    Returns:
      - None
    """
    existing_schema = get_table_schema(table_name)
    
    for column_name, column_type in new_attributes.items():
        if column_name not in existing_schema:
            # Add new column
            alter_table(table_name, 'ADD', column_name, column_type)
        elif existing_schema[column_name] != column_type:
            # Alter existing column
            alter_table(table_name, 'ALTER', column_name, column_type)
    
    for column_name in existing_schema.keys():
        if column_name not in new_attributes:
            # Drop column that is not in new attributes
            alter_table(table_name, 'DROP', column_name)

def drop_table(table_name):
    """
    Drop the specified table from the database.
    
    Parameters:
      - table_name (str): Name of the table to drop.
    
    Returns:
      - None
    """
    table = safe_identifier(table_name)
    query = f"DROP TABLE IF EXISTS {table} CASCADE"
    
    with get_connection() as conn:
        with conn.cursor() as cursor:
            cursor.execute(query)
            conn.commit()

def delete_all_records(table_name):
    """
    Delete all records from the specified table.
    
    Parameters:
      - table_name (str): Name of the table.
    
    Returns:
      - None
    """
    table = safe_identifier(table_name)
    query = f"DELETE FROM {table}"
    
    with get_connection() as conn:
        with conn.cursor() as cursor:
            cursor.execute(query)
            conn.commit()
            
def execute_query(query: str):
    """
    Execute a custom SQL query.
    
    Parameters:
      - query (str): The SQL query to execute.
    """
    with get_connection() as conn:
        with conn.cursor() as cursor:
            cursor.execute(query)
            conn.commit()

def excecute_query_with_return(query: str):
    """
    Execute a custom SQL query and return the result.
    
    Parameters:
      - query (str): The SQL query to execute.
    
    Returns:
      - The result of the query.
    """
    with get_connection() as conn:
        with conn.cursor() as cursor:
            cursor.execute(query)
            return dictfetchall(cursor)
          
def get_products_by_title(search: str):
    conn = get_connection()
    try:
        cursor = conn.cursor(cursor_factory=RealDictCursor)
        query = "SELECT * FROM products WHERE title ILIKE %s"
        cursor.execute(query, (f"%{search}%",))
        results = dictfetchall(cursor)
        return results
    except Exception as e:
        print("Error fetching products:", e)
        return []
    finally:
        cursor.close()
        conn.close()