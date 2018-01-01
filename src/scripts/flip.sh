files=$1
prefix=$2

for file in files 
do
	convert $file -rotate 90 $prefix-$file
done
