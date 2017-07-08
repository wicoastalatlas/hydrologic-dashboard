#First, try to get the data from the URL:
#http://waterdata.usgs.gov/nwis/dv?referred_module=sw&multiple_site_no=04072150,04072845,04073365,04073462,04073466,04073468,04073473,04073500,04073970,04075365,04077630,04078500,04079000,04080000,04081000,04082400,04083545,04084445,04084500,04084911,04085046,04085068,040851325,040851378,040851385,0407809265,441624088045601&cb_00060=on&begin_date=2003-01-01&format=rdb%22
#this works as a test URL: http://ratatoskr.org/testdata.txt

import sys
import urllib2 #imports the module to fetch data from the web. urllib2 is updated version of urllib.
import csv #work with csv files
import re #matching tool
from itertools import groupby #allows us to use keywords 

#newData gets the data and saves it as a variable. 
newData = urllib2.urlopen("http://waterdata.usgs.gov/nwis/dv?referred_module=sw&multiple_site_no=04072150%2C04072845%2C04073365%2C04073462%2C04073466%2C04073468%2C04073473%2C04073500%2C04073970%2C04074538%2C04074548%2C04074950%2C04075365%2C04077630%2C04078500%2C04079000%2C04080000%2C04081000%2C04082400%2C04083545%2C04084445%2C04084500%2C04084911%2C04085046%2C04085068%2C040851325%2C040851378%2C040851385%2C0407809265%2C441624088045601&cb_00060=on&begin_date=2003-01-01&format=rdb").read() 

def getData(x): #writes the contents of newData into a .txt file
    writeData = open('USGS_RawData.txt', 'w') 
    writeData.write(x) 
    writeData.close #always need to close the write command.

def trimData(): #searches testdata.txt for lines that start with USGS and writes them to a new file (this is the data we need.)
    USGSData = open('USGS_RawData.txt', 'r')
    with open('trimmedData.txt', 'w') as out: 
        for line in USGSData: 
            if re.match("USGS", line):
                out.write(line)
            
def csvConversion(): #converts the data from a tab delimited text file into a .csv file
    txtData = r"trimmedData.txt"
    csvData = r"csvData.csv"
    in_txt = csv.reader(open(txtData, "rb"), delimiter = '\t')
    out_csv = csv.writer(open(csvData, "wb"))
    out_csv.writerows(in_txt)

def splitCsv(): #groups the contents of the .csv file based on the contents of row 1 (stationID) and then writes a new file with the station ID as the name, and only date and flow values contained within.
    for key, rows in groupby(csv.reader(open("csvData.csv")), lambda row: row[1]):
        with open("C:\Apache24\htdocs\hydrologic\data\streamflow\%s.csv" % key, "wb") as output: #this is where you can define the output directory. It runs from the relative path from the current directory, though, you can put an absolute path in if you want. I currently have the new files being made in the directory I called "split": ./split/*.csv
            wtr = csv.writer( output )
            for r in rows:
                wtr.writerow( (r[2], r[3]) )
                
getData(newData)
trimData()
csvConversion()
splitCsv()
#sys.exit()
