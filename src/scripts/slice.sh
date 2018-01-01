
w=$(identify -format '%w' ${1})
h=$(identify -format '%h' ${1})
wsprite=${2}
hsprite=${3}
nrows=$(echo "$h / $hsprite - 1" | bc)
ncols=$(echo "$w / $wsprite - 1" | bc)

for y in `seq 0 ${nrows}`
do
	y2=$(echo "$y * $hsprite" | bc) 
	for x in `seq 0 ${ncols}`
	do
		x2=$(echo "$x * $wsprite" | bc) 
		ffmpeg -i "${1}" -vf  "crop=${wsprite}:${hsprite}:${x2}:${y2}" ${1}${x}-${y}.png
	done
done 

