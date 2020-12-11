import zlib
import glob, os
from pathlib import Path


def inflate(file_path):
	symbol = Path(file_path).resolve().stem
	print('Unpacking raw zlib compressed file {}'.format(symbol))
	new_filename = '{}.csv'.format(symbol)
	with open(file_path, 'rb') as in_f, open(new_filename, 'wb') as ou_f:
		raw_data = in_f.read()
		data = zlib.decompress(raw_data)
		ou_f.write(data)


for file in glob.glob('../*.csvz'):
	inflate(file)

