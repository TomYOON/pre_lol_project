# settings.py
from dotenv import load_dotenv
load_dotenv()

# OR, the same with increased verbosity
load_dotenv(verbose=True)

# OR, explicitly providing path to '.env'
from pathlib import Path  # Python 3.6+ only
env_path = Path('../config') / '.env'
load_dotenv(dotenv_path=env_path)

import os
# SECRET_KEY = os.getenv("EMAIL")
DATABASE_PASSWORD = os.getenv("MONGO_PWD")
LOL_MONGO_URL = os.getenv('LOL_MONGO_URL')

if __name__ == '__main__':
  print(LOL_MONGO_URL)