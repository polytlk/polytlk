separators = ['; ', ', ']

def split_by_separators(data: str): 
    for separator in separators:
        if separator in data:
            # Split the item by the first found separator
            return data.split(separator)
    # If no separator is found, return the original data as a list
    return [data]
