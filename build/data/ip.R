#read in heartland data

library(tidyverse)
library(readxl)
library(sf)

file <- "/home/alec/Projects/Brookings/heartland/build/data/Interactive_Data_Top9_v3.xlsx"
cbsa_shp <- "http://www2.census.gov/geo/tiger/GENZ2017/shp/cb_2017_us_cbsa_5m.zip"
st_shp <- "http://www2.census.gov/geo/tiger/GENZ2017/shp/cb_2017_us_state_5m.zip"

download.file(cbsa_shp, "/home/alec/Projects/Brookings/heartland/build/data/cbsa_shp.zip")
download.file(st_shp, "/home/alec/Projects/Brookings/heartland/build/data/st_shp.zip")

unzip("/home/alec/Projects/Brookings/heartland/build/data/cbsa_shp.zip", exdir="/home/alec/Projects/Brookings/heartland/build/data/cbsa_shp")
unzip("/home/alec/Projects/Brookings/heartland/build/data/st_shp.zip", exdir="/home/alec/Projects/Brookings/heartland/build/data/st_shp")

file.remove("/home/alec/Projects/Brookings/heartland/build/data/cbsa_shp.zip", "/home/alec/Projects/Brookings/heartland/build/data/st_shp.zip")

cbsa <- st_read("/home/alec/Projects/Brookings/heartland/build/data/cbsa_shp", "cb_2017_us_cbsa_5m") %>% mutate(fips=as.character(CBSAFP))
st <- st_read("/home/alec/Projects/Brookings/heartland/build/data/st_shp", "cb_2017_us_state_5m") %>% mutate(fips=as.character(STATEFP))

#EMP
emp <- list()
emp$state <- read_excel(file, sheet="Emp_State")
emp$msa <- read_excel(file, sheet="Emp_MSA")
emp$micro <- read_excel(file, sheet="Emp_Micro")
emp$rural <- read_excel(file, sheet="Emp_Rural")
emp_all <- bind_rows(emp) %>% filter(!is.na(Name)) %>% mutate(fips=as.character(`FIPS Code`)) %>% rename_all(function(n){return(ifelse(n=="fips", n, paste0("emp_",n)))})
emp$missing <- bind_rows(emp) %>% filter(is.na(Name))

#GDP
gdp <- list()
gdp$state <- read_excel(file, sheet="GDP_State", skip=1)
gdp$msa <- read_excel(file, sheet="GDP_MSA", skip=1)
gdp$micro <- read_excel(file, sheet="GDP_Micro", skip=1)
gdp$rural <- read_excel(file, sheet="GDP_Rural", skip=1)
gdp_all <- bind_rows(gdp) %>% filter(!is.na(Name)) %>% mutate(fips=as.character(`FIPS Code`)) %>% rename_all(function(n){return(ifelse(n=="fips", n, paste0("gdp_",n)))})
gdp$missing <- bind_rows(gdp) %>% filter(is.na(Name))

#JYF
jyf <- list()
jyf$state <- read_excel(file, sheet="JobsYFirms_State")
jyf$msa <- read_excel(file, sheet="JobsYFirms_MSA")
jyf$micro <- read_excel(file, sheet="JobsYFirms_Micro")
jyf$rural <- read_excel(file, sheet="JobsYFirms_Rural")
jyf_all <- bind_rows(jyf) %>% filter(!is.na(Name)) %>% mutate(fips=as.character(`FIPS Code`)) %>% rename_all(function(n){return(ifelse(n=="fips", n, paste0("jyf_",n)))})
jyf$missing <- bind_rows(jyf) %>% filter(is.na(Name))

#Productivity
prod <- list()
prod$state <- read_excel(file, sheet="Prod_State") %>% rename(`FIPS Code`=FIPs)
prod$msa <- read_excel(file, sheet="Prod_MSA")
prod$micro <- read_excel(file, sheet="Prod_Micro")
prod$rural <- read_excel(file, sheet="Prod_Rural")
prod_all <- bind_rows(prod) %>% filter(!is.na(Name)) %>% mutate(fips=as.character(`FIPS Code`)) %>% rename_all(function(n){return(ifelse(n=="fips", n, paste0("prod_",n)))})
prod$missing <- bind_rows(prod) %>% filter(is.na(Name))

#Avg wage
avgwage <- list()
avgwage$state <- read_excel(file, sheet="AvgWages_State")
avgwage$msa <- read_excel(file, sheet="AvgWages_MSA")
avgwage$micro <- read_excel(file, sheet="AvgWages_Micro")
avgwage$rural <- read_excel(file, sheet="AvgWages_Rural")
avgwage_all <- bind_rows(avgwage) %>% filter(!is.na(Name)) %>% mutate(fips=as.character(`FIPS Code`)) %>% rename_all(function(n){return(ifelse(n=="fips", n, paste0("avgwage_",n)))})
avgwage$missing <- bind_rows(avgwage) %>% filter(is.na(Name))

#Standard of living
sol <- list()
sol$state <- read_excel(file, sheet="SoL_State") %>% rename(`FIPS Code`=FIPs)
sol$msa <- read_excel(file, sheet="SoL_MSA")
sol$micro <- read_excel(file, sheet="SoL_Micro")
sol$rural <- read_excel(file, sheet="SoL_Rural")
sol_all <- bind_rows(sol) %>% filter(!is.na(Name)) %>% mutate(fips=as.character(`FIPS Code`)) %>% rename_all(function(n){return(ifelse(n=="fips", n, paste0("sol_",n)))})
sol$missing <- bind_rows(sol) %>% filter(is.na(Name))

#Emp/Pop
epop <- list()
epop$state <- read_excel(file, sheet="EmpPop_State") %>% rename(`FIPS Code`=FIPS, Name=State)
epop$msa <- read_excel(file, sheet="EmpPop_MSA")
epop$micro <- read_excel(file, sheet="EmpPop_Micro")
epop$rural <- read_excel(file, sheet="EmpPop_Rural")
epop_all <- bind_rows(epop) %>% filter(!is.na(Name)) %>% mutate(fips=as.character(`FIPS Code`)) %>% rename_all(function(n){return(ifelse(n=="fips", n, paste0("epop_",n)))})
epop$missing <- bind_rows(epop) %>% filter(is.na(Name))

#Median earnings
medearn <- list()
medearn$state <- read_excel(file, sheet="MedEarn_State") %>% rename(`FIPS Code`=FIPS)
medearn$msa <- read_excel(file, sheet="MedEarn_MSA")
medearn$micro <- read_excel(file, sheet="MedEarn_Micro")
medearn$rural <- read_excel(file, sheet="MedEarn_Rural")
medearn_all <- bind_rows(medearn) %>% filter(!is.na(Name)) %>% mutate(fips=as.character(`FIPS Code`)) %>% rename_all(function(n){return(ifelse(n=="fips", n, paste0("medearn_",n)))})
medearn$missing <- bind_rows(medearn) %>% filter(is.na(Name))

#Poverty rate
povrate <- list()
povrate$state <- read_excel(file, sheet="PovRate_State")
povrate$msa <- read_excel(file, sheet="PovRate_MSA")
povrate$micro <- read_excel(file, sheet="PovRate_Micro")
povrate$rural <- read_excel(file, sheet="PovRate_Rural")
povrate_all <- bind_rows(povrate) %>% filter(!is.na(Name)) %>% mutate(fips=as.character(`FIPS Code`)) %>% rename_all(function(n){return(ifelse(n=="fips", n, paste0("povrate_",n)))})
povrate$missing <- bind_rows(povrate) %>% filter(is.na(Name))

cbsa2 <- cbsa %>% left_join(emp_all, by="fips") %>%
                  left_join(gdp_all, by="fips") %>%
                  left_join(jyf_all, by="fips") %>%
                  left_join(sol_all, by="fips") %>%
                  left_join(prod_all, by="fips") %>%
                  left_join(avgwage_all, by="fips") %>%
                  left_join(medearn_all, by="fips") %>%
                  left_join(epop_all, by="fips") %>%
                  left_join(povrate_all, by="fips")

rm(list=(tibble(obs=ls(1)) %>% filter(obs!="cbsa2"))$obs)

saveRDS(cbsa2, file="/home/alec/Projects/Brookings/heartland/build/data/md/cbsa2.rds")

#testing inner_join
#ij1 <- as_tibble(data.frame(A1=1:3, B=c("A","B","C")))
#ij2 <- data.frame(A2=11:13, B=c("A","B","C"))
#debug(inner_join)
#j<-inner_join(ij1, ij2, by="B")
#undebug(inner_join)

#same_src(ij1, ij2)
