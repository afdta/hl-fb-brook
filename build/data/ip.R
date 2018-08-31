#read in heartland data

library(tidyverse)
library(readxl)
library(sf)

file <- "/home/alec/Projects/Brookings/heartland/build/data/Interactive_Data_Top9_v3.xlsx"
driver_file <- "/home/alec/Projects/Brookings/heartland/build/data/Interactive_Data_Drivers_v5.xlsx"

#EMP
emp <- list()
emp$state <- read_excel(file, sheet="Emp_State") %>% mutate(geolevel=1)
emp$msa <- read_excel(file, sheet="Emp_MSA") %>% mutate(geolevel=2)
emp$micro <- read_excel(file, sheet="Emp_Micro") %>% mutate(geolevel=3)
emp$rural <- read_excel(file, sheet="Emp_Rural") %>% mutate(geolevel=4)
emp_all <- bind_rows(emp) %>% filter(!is.na(Name)) %>% mutate(fips=as.character(`FIPS Code`)) %>% rename_all(function(n){return(ifelse(n=="fips" | n=="Name" | n=="geolevel", n, paste0("emp_",n)))})
emp$missing <- bind_rows(emp) %>% filter(is.na(Name))

#GDP
gdp <- list()
gdp$state <- read_excel(file, sheet="GDP_State", skip=1) %>% mutate(geolevel=1)
gdp$msa <- read_excel(file, sheet="GDP_MSA", skip=1) %>% mutate(geolevel=2)
gdp$micro <- read_excel(file, sheet="GDP_Micro", skip=1) %>% mutate(geolevel=3)
gdp$rural <- read_excel(file, sheet="GDP_Rural", skip=1) %>% mutate(geolevel=4)
gdp_all <- bind_rows(gdp) %>% filter(!is.na(Name)) %>% mutate(fips=as.character(`FIPS Code`)) %>% rename_all(function(n){return(ifelse(n=="fips" | n=="Name" | n=="geolevel", n, paste0("gdp_",n)))})
gdp$missing <- bind_rows(gdp) %>% filter(is.na(Name))

#JYF
jyf <- list()
jyf$state <- read_excel(file, sheet="JobsYFirms_State") %>% mutate(geolevel=1)
jyf$msa <- read_excel(file, sheet="JobsYFirms_MSA") %>% mutate(geolevel=2)
jyf$micro <- read_excel(file, sheet="JobsYFirms_Micro") %>% mutate(geolevel=3)
jyf$rural <- read_excel(file, sheet="JobsYFirms_Rural") %>% mutate(geolevel=4)
jyf_all <- bind_rows(jyf) %>% filter(!is.na(Name)) %>% mutate(fips=as.character(`FIPS Code`)) %>% rename_all(function(n){return(ifelse(n=="fips" | n=="Name" | n=="geolevel", n, paste0("jyf_",n)))})
jyf$missing <- bind_rows(jyf) %>% filter(is.na(Name))

#Productivity
prod <- list()
prod$state <- read_excel(file, sheet="Prod_State") %>% rename(`FIPS Code`=FIPs) %>% mutate(geolevel=1)
prod$msa <- read_excel(file, sheet="Prod_MSA") %>% mutate(geolevel=2)
prod$micro <- read_excel(file, sheet="Prod_Micro") %>% mutate(geolevel=3)
prod$rural <- read_excel(file, sheet="Prod_Rural") %>% mutate(geolevel=4)
prod_all <- bind_rows(prod) %>% filter(!is.na(Name)) %>% mutate(fips=as.character(`FIPS Code`)) %>% rename_all(function(n){return(ifelse(n=="fips" | n=="Name" | n=="geolevel", n, paste0("prod_",n)))})
prod$missing <- bind_rows(prod) %>% filter(is.na(Name))

#Avg wage
avgwage <- list()
avgwage$state <- read_excel(file, sheet="AvgWages_State") %>% mutate(geolevel=1)
avgwage$msa <- read_excel(file, sheet="AvgWages_MSA") %>% mutate(geolevel=2)
avgwage$micro <- read_excel(file, sheet="AvgWages_Micro") %>% mutate(geolevel=3)
avgwage$rural <- read_excel(file, sheet="AvgWages_Rural") %>% mutate(geolevel=4)
avgwage_all <- bind_rows(avgwage) %>% filter(!is.na(Name)) %>% mutate(fips=as.character(`FIPS Code`)) %>% rename_all(function(n){return(ifelse(n=="fips" | n=="Name" | n=="geolevel", n, paste0("avgwage_",n)))})
avgwage$missing <- bind_rows(avgwage) %>% filter(is.na(Name))

#Standard of living
sol <- list()
sol$state <- read_excel(file, sheet="SoL_State") %>% rename(`FIPS Code`=FIPs) %>% mutate(geolevel=1)
sol$msa <- read_excel(file, sheet="SoL_MSA") %>% mutate(geolevel=2)
sol$micro <- read_excel(file, sheet="SoL_Micro") %>% mutate(geolevel=3)
sol$rural <- read_excel(file, sheet="SoL_Rural") %>% mutate(geolevel=4)
sol_all <- bind_rows(sol) %>% filter(!is.na(Name)) %>% mutate(fips=as.character(`FIPS Code`)) %>% rename_all(function(n){return(ifelse(n=="fips" | n=="Name" | n=="geolevel", n, paste0("sol_",n)))})
sol$missing <- bind_rows(sol) %>% filter(is.na(Name))

#Emp/Pop
epop <- list()
epop$state <- read_excel(file, sheet="EmpPop_State") %>% rename(`FIPS Code`=FIPS, Name=State) %>% mutate(geolevel=1)
epop$msa <- read_excel(file, sheet="EmpPop_MSA") %>% mutate(geolevel=2)
epop$micro <- read_excel(file, sheet="EmpPop_Micro") %>% mutate(geolevel=3)
epop$rural <- read_excel(file, sheet="EmpPop_Rural") %>% mutate(geolevel=4)
epop_all <- bind_rows(epop) %>% filter(!is.na(Name)) %>% mutate(fips=as.character(`FIPS Code`)) %>% rename_all(function(n){return(ifelse(n=="fips" | n=="Name" | n=="geolevel", n, paste0("epop_",n)))})
epop$missing <- bind_rows(epop) %>% filter(is.na(Name))

#Median earnings
medearn <- list()
medearn$state <- read_excel(file, sheet="MedEarn_State") %>% rename(`FIPS Code`=FIPS) %>% mutate(geolevel=1)
medearn$msa <- read_excel(file, sheet="MedEarn_MSA") %>% mutate(geolevel=2)
medearn$micro <- read_excel(file, sheet="MedEarn_Micro") %>% mutate(geolevel=3)
medearn$rural <- read_excel(file, sheet="MedEarn_Rural") %>% mutate(geolevel=4)
medearn_all <- bind_rows(medearn) %>% filter(!is.na(Name)) %>% mutate(fips=as.character(`FIPS Code`)) %>% rename_all(function(n){return(ifelse(n=="fips" | n=="Name" | n=="geolevel", n, paste0("medearn_",n)))})
medearn$missing <- bind_rows(medearn) %>% filter(is.na(Name))

#Poverty rate
povrate <- list()
povrate$state <- read_excel(file, sheet="PovRate_State") %>% mutate(geolevel=1)
povrate$msa <- read_excel(file, sheet="PovRate_MSA") %>% mutate(geolevel=2)
povrate$micro <- read_excel(file, sheet="PovRate_Micro") %>% mutate(geolevel=3)
povrate$rural <- read_excel(file, sheet="PovRate_Rural") %>% mutate(geolevel=4)
povrate_all <- bind_rows(povrate) %>% filter(!is.na(Name)) %>% mutate(fips=as.character(`FIPS Code`)) %>% rename_all(function(n){return(ifelse(n=="fips" | n=="Name" | n=="geolevel", n, paste0("povrate_",n)))})
povrate$missing <- bind_rows(povrate) %>% filter(is.na(Name))

# TODO -- FIX GEO CODES FOR AGGREGATES

the9 <- emp_all %>%
        full_join(gdp_all, by=c("fips", "Name", "geolevel")) %>%
        full_join(jyf_all, by=c("fips", "Name", "geolevel")) %>%
        full_join(sol_all, by=c("fips", "Name", "geolevel")) %>%
        full_join(prod_all, by=c("fips", "Name", "geolevel")) %>%
        full_join(avgwage_all, by=c("fips", "Name", "geolevel")) %>%
        full_join(medearn_all, by=c("fips", "Name", "geolevel")) %>%
        full_join(epop_all, by=c("fips", "Name", "geolevel")) %>%
        full_join(povrate_all, by=c("fips", "Name", "geolevel"))

the9_agg <- the9 %>% filter(grepl("^Heartland|^Non", .$Name))

saveRDS(the9, file="/home/alec/Projects/Brookings/heartland/build/data/md/core9.rds")

melted <- the9 %>% filter(!grepl("^Heartland|^Non", .$Name)) %>%
                   select(fips, Name, geolevel, `emp_CAGR_10-17`, `gdp_CAGR_10-16`, `jyf_Share change, 2010-16`,
                   `sol_CAGR_10-16`, `prod_CAGR_10-16`, `avgwage_CAGR_2010-16`, 
                   `medearn_CAGR_10-16`, `epop_EmpPop_Change_10-16`, `povrate_2010-16`) %>% gather("variable", "value", -1:-3)

agg <- 

# the9 <- readRDS(file="/home/alec/Projects/Brookings/heartland/build/data/md/core9.rds")

#geos
geos <- the9 %>% select(fips, Name, geolevel) %>% unique()

#geo (shp) data
cbsa_shp <- "http://www2.census.gov/geo/tiger/GENZ2017/shp/cb_2017_us_cbsa_5m.zip"
st_shp <- "http://www2.census.gov/geo/tiger/GENZ2017/shp/cb_2017_us_state_5m.zip"

download.file(cbsa_shp, "/home/alec/Projects/Brookings/heartland/build/data/cbsa_shp.zip")
download.file(st_shp, "/home/alec/Projects/Brookings/heartland/build/data/st_shp.zip")

unzip("/home/alec/Projects/Brookings/heartland/build/data/cbsa_shp.zip", exdir="/home/alec/Projects/Brookings/heartland/build/data/cbsa_shp")
unzip("/home/alec/Projects/Brookings/heartland/build/data/st_shp.zip", exdir="/home/alec/Projects/Brookings/heartland/build/data/st_shp")

file.remove("/home/alec/Projects/Brookings/heartland/build/data/cbsa_shp.zip", "/home/alec/Projects/Brookings/heartland/build/data/st_shp.zip")

cbsa <- st_read("/home/alec/Projects/Brookings/heartland/build/data/cbsa_shp", "cb_2017_us_cbsa_5m") %>% mutate(fips=as.character(CBSAFP))
st <- st_read("/home/alec/Projects/Brookings/heartland/build/data/st_shp", "cb_2017_us_state_5m") %>% mutate(fips=as.character(STATEFP))

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


#read in drivers data
driver_sheets <- excel_sheets(driver_file)
drivers <- lapply(driver_sheets, function(nm){
  d<-read_excel(driver_file, sheet=nm)
  cat(nm)
  cat("\n")
  print(d)
  cat("\n")
  return(d)
})



#testing inner_join
#ij1 <- as_tibble(data.frame(A1=1:3, B=c("A","B","C")))
#ij2 <- data.frame(A2=11:13, B=c("A","B","C"))
#debug(inner_join)
#j<-inner_join(ij1, ij2, by="B")
#undebug(inner_join)

#same_src(ij1, ij2)
