install.packages("jsonlite")
install.packages("rjson")
install.packages("data.table")
install.packages("readxl")

setwd("D:/Dropbox/Hugo/Patenty/genData")
#setwd("C:/Users/vitekzkytek/Dropbox/Hugo/Patenty/genData")

#IMPORT EXCEL
library(readxl)
library(jsonlite)
patents <- read_excel("181102_Data_FakePeriods.xlsx")
patents$ID <- seq.int(nrow(patents))
patents$children <- "children"

patents = patents[patents$citations_All > 0,]
library(data.table)
dt <- as.data.table(patents)

#VITEK ADDED:
dt_split <- split(dt,by=c("period","children"),keep.by=F,flatten=F)
exportJson <- toJSON(dt_split, dataframe = "rows", pretty=T, encoding="UTF-8")
writeLines(c('var patents = {\n "name":"patents", \n' ,exportJson),"treedata.js",useBytes=T) 
### After writing, copy treedata.js into Patenty/data, need to delete "{"right before children node.

# SELECT2 JSON
#IMPORT EXCEL
library(readxl)
patents <- read_excel("181026_Data_VitekPaulina.xlsx")
patents$id <- patents$ico
patents$level <- rep(1,nrow(patents))
patents$text <- patents$name
patents$displayed = T
patents$displayed[patents$citations_All == 0] = F
library(data.table)
dt <- as.data.table(patents)
#colnames(dt)[2] = "text"
library(jsonlite)
s = toJSON(dt,dataframe='rows',pretty=F,encoding="UTF-8")
writeLines(c('var menudata = ' ,s),"ddldata.js",useBytes=T) 
### After writing, copy ddldata.js into Patenty/data










#### NOT USED


#podla kategorie
dt_split1 <- split(dt, by=c("kategorie2", "children"), keep.by=F, flatten=FALSE)
library(jsonlite)
exportJson <- toJSON(dt_split1, dataframe = "rows", pretty=T, encoding = "UTF-8")



#exportJson <- toJSON(dt_split1)
write(exportJson, "data_children1.json",fileEncoding="UTF-8")
write(exportJson, "data_children1.json",useBytes=T)



#podla ID
dt_split2 <- split(dt, by=c("ID"), keep.by=T, flatten=FALSE)
library(jsonlite)
toJSON(dt_split2, dataframe = "columns", pretty=T)

exportJson <- toJSON(dt_split2)
write(exportJson, "data2.json")



#zoom
#IMPORT EXCEL
library(readxl)
patents <- read_excel("180917_Data_VitekPaulina.xlsx",  skip = 1)
patents$kategorie2 = patents$kategorie
patents$ID <- seq.int(nrow(patents))
library(data.table)
dt <- as.data.table(patents)

#podla kategorie
dt_split1 <- split(dt, by=c("kategorie2"), keep.by=F, flatten=FALSE)
library(jsonlite)
toJSON(dt_split1, dataframe = "columns", pretty=T)

exportJson <- toJSON(dt_split1)
write(exportJson, "data_children1.json")





# SELECT2 JSON
#IMPORT EXCEL
library(readxl)
patents <- read_excel("180917_Data_VitekPaulina.xlsx",  skip = 1)
patents$id <- seq.int(nrow(patents))
patents$level <- rep(1,nrow(patents))
patents$displayed <- rep(T,nrow(patents))
library(data.table)
dt <- as.data.table(patents)
colnames(dt)[2] = "text"
library(jsonlite)
s = toJSON(dt,dataframe='rows',pretty=F,encoding="UTF-8")




#podla kategorie
dt_split1 <- split(dt, by=c("kategorie2", "children"), keep.by=F, flatten=FALSE)
library(jsonlite)
toJSON(dt_split1, dataframe = "columns", pretty=F, encoding = "UTF-8")

exportJson <- toJSON(dt_split)
write(exportJson, "data_children1.json",fileEncoding="UTF-8")
write(exportJson, "data_children1.json",useBytes=T)


