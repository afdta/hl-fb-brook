library(tidyverse)
library(sf)
library(jsonlite)

outcomes <- readRDS(file="/home/alec/Projects/Brookings/heartland/build/data/md/outcomes.rds")

#geo data
#geos
geos <- outcomes %>% select(fips, Name, geolevel) %>% unique()

#geo (shp) data
cbsa_shp <- "http://www2.census.gov/geo/tiger/GENZ2017/shp/cb_2017_us_cbsa_5m.zip"
st_shp <- "http://www2.census.gov/geo/tiger/GENZ2017/shp/cb_2017_us_state_5m.zip"

download.file(cbsa_shp, "/home/alec/Projects/Brookings/heartland/build/data/cbsa_shp.zip")
download.file(st_shp, "/home/alec/Projects/Brookings/heartland/build/data/st_shp.zip")

unzip("/home/alec/Projects/Brookings/heartland/build/data/cbsa_shp.zip", exdir="/home/alec/Projects/Brookings/heartland/build/data/cbsa_shp")
unzip("/home/alec/Projects/Brookings/heartland/build/data/st_shp.zip", exdir="/home/alec/Projects/Brookings/heartland/build/data/st_shp")

file.remove("/home/alec/Projects/Brookings/heartland/build/data/cbsa_shp.zip", "/home/alec/Projects/Brookings/heartland/build/data/st_shp.zip")

cbsa0 <- st_read("/home/alec/Projects/Brookings/heartland/build/data/cbsa_shp", "cb_2017_us_cbsa_5m") %>% mutate(fips=as.character(CBSAFP))
st <- st_read("/home/alec/Projects/Brookings/heartland/build/data/st_shp", "cb_2017_us_state_5m") %>% mutate(fips=as.character(STATEFP))

cbsaxy <- st_centroid(cbsa0)
cbsaxy$lon <- st_coordinates(cbsaxy$geometry)[,"X"]
cbsaxy$lat <- st_coordinates(cbsaxy$geometry)[,"Y"]

geos %>% group_by(geolevel) %>% summarise(n=n())
final <- inner_join(geos %>% filter(geolevel==2 | geolevel==3), 
                    cbsaxy %>% as.data.frame() %>% mutate(fips=as.character(GEOID), name=as.character(NAME)) %>% select(fips, name, lon, lat))

final_split <- inner_join(final %>% select(-Name), tibble(geo=c("state", "metro", "micro", "rural"), geolevel=1:4)) %>% as.data.frame() %>% 
                      split(.$geo) %>% lapply(function(g){
                        return(split(g, g$fips) %>% lapply(function(d){return(unbox(d))}) )
                      })
  


writeLines(c("var cbsa_geos = ", toJSON(final_split, digits=5), ";", "export default cbsa_geos;"), "/home/alec/Projects/Brookings/heartland/build/js/cbsa-geos.js")


which(duplicated(final$fips))

#test
textxy <- strsplit(gsub("(^.*\\()|\\)", "", st_as_text(cbsaxy$geometry, digits=7))," ") %>% 
            lapply(function(r){return(data.frame(X=as.numeric(r[1]), Y=as.numeric(r[2])))}) %>% 
            do.call("rbind", .)

max(abs(textxy$X - cbsaxy$lon))
min(abs(textxy$Y - cbsaxy$lat))


geos %>% filter(geolevel==1, !grepl("^Heartland|^Non", Name) ) %>% mutate(fips=as.numeric(fips)) %>% select(fips, name=Name) %>% spread(fips, name) %>% unbox() %>% toJSON()




cbsa1 <- inner_join(cbsa0, st_centroid(cbsa) %>% select(GEOID, centroid=geometry) )

ggplot() + geom_sf(data=cbsa) + geom_sf(data=cbsaxy)

toJSON(cbsaxy)


coords <- st_coordinates(cbsaxy)

plot(cbsa)

#SCRAP below

cbsa2 <- cbsa %>% left_join(emp_all, by="fips") %>%
  left_join(gdp_all, by="fips") %>%
  left_join(jyf_all, by="fips") %>%
  left_join(sol_all, by="fips") %>%
  left_join(prod_all, by="fips") %>%
  left_join(avgwage_all, by="fips") %>%
  left_join(medearn_all, by="fips") %>%
  left_join(epop_all, by="fips") %>%
  left_join(povrate_all, by="fips")

saveRDS(cbsa2, file="/home/alec/Projects/Brookings/heartland/build/data/md/cbsa2.rds")

rm(list=(tibble(obs=ls(1)) %>% filter(obs!="cbsa2"))$obs)