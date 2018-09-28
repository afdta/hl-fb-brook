#read in heartland data
#TODO: Check data for dups
#TODO: Make lookup data for geos missing, place all lookup in single geo object to avoid text bloat in JSON
#read in json, cmpare to original data

library(tidyverse)
library(jsonlite)
library(readxl)

file <- "/home/alec/Projects/Brookings/heartland/build/data/Interactive_Data_Top9_v3.xlsx"
driver_file <- "/home/alec/Projects/Brookings/heartland/build/data/Interactive_Data_Drivers_v5.xlsx"

#DATA

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
epop$state <- read_excel(file, sheet="EmpPop_State") %>% rename(`FIPS Code`=FIPS, Name=State, `2010-16`=`EmpPop_Change_10-16`, `2010`=EmpPop_10, `2016`=EmpPop_16) %>% mutate(geolevel=1)
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

outcomes <- emp_all %>%
        full_join(gdp_all, by=c("fips", "Name", "geolevel")) %>%
        full_join(jyf_all, by=c("fips", "Name", "geolevel")) %>%
        full_join(sol_all, by=c("fips", "Name", "geolevel")) %>%
        full_join(prod_all, by=c("fips", "Name", "geolevel")) %>%
        full_join(avgwage_all, by=c("fips", "Name", "geolevel")) %>%
        full_join(medearn_all, by=c("fips", "Name", "geolevel")) %>%
        full_join(epop_all, by=c("fips", "Name", "geolevel")) %>%
        full_join(povrate_all, by=c("fips", "Name", "geolevel"))

#drivers

#adv industries
ai <- list()
ai$state <- read_excel(driver_file, sheet="Adv Industries_State") %>% mutate(geolevel=1)
ai_all <- bind_rows(ai) %>% filter(!is.na(Name)) %>% mutate(fips=as.character(FIPs)) %>% rename_all(function(n){return(ifelse(n=="fips" | n=="Name" | n=="geolevel", n, paste0("ai_",n)))})
ai$missing <- bind_rows(ai) %>% filter(is.na(Name))

#exports
ex <- list()
ex$state <- read_excel(driver_file, sheet="Exports_State") %>% mutate(geolevel=1)
ex_all <- bind_rows(ex) %>% filter(!is.na(Name)) %>% mutate(fips=as.character(FIPs)) %>% rename_all(function(n){return(ifelse(n=="fips" | n=="Name" | n=="geolevel", n, paste0("ex_",n)))})
ex$missing <- bind_rows(ex) %>% filter(is.na(Name))

#pop
pop <- list()
pop$state <- read_excel(driver_file, sheet="Population_State") %>% mutate(geolevel=1) %>% rename(`FIPS Code`=FIPs, `CAGR_2010-17`=`CAGR_10-17`)
pop$msa <- read_excel(driver_file, sheet="Population_MSA") %>% mutate(geolevel=2)
pop$micro <- read_excel(driver_file, sheet="Population_Micro") %>% mutate(geolevel=3)
pop$rural <- read_excel(driver_file, sheet="Population_Rural") %>% mutate(geolevel=4)
pop_all <- bind_rows(pop) %>% filter(!is.na(Name)) %>% mutate(fips=as.character(`FIPS Code`)) %>% rename_all(function(n){return(ifelse(n=="fips" | n=="Name" | n=="geolevel", n, paste0("pop_",n)))})
pop$missing <- bind_rows(pop) %>% filter(is.na(Name))

#young adults
ya <- list()
ya$state <- read_excel(driver_file, sheet="Young Adults_State") %>% mutate(geolevel=1)
ya_all <- bind_rows(ya) %>% filter(!is.na(Name)) %>% mutate(fips=as.character(FIPS)) %>% rename_all(function(n){return(ifelse(n=="fips" | n=="Name" | n=="geolevel", n, paste0("ya_",n)))})
ya$missing <- bind_rows(ya) %>% filter(is.na(Name))

#edattain
edu <- list()
edu$state <- read_excel(driver_file, sheet="Edu Attainment_State") %>% mutate(geolevel=1)
edu_all <- bind_rows(edu) %>% filter(!is.na(Name)) %>% mutate(fips=as.character(FIPs)) %>% rename_all(function(n){return(ifelse(n=="fips" | n=="Name" | n=="geolevel", n, paste0("edu_",n)))})
edu$missing <- bind_rows(ya) %>% filter(is.na(Name))

#R&D
rd <- list()
rd$state <- read_excel(driver_file, sheet="R&D_State") %>% mutate(geolevel=1)
rd_all <- bind_rows(rd) %>% filter(!is.na(Name)) %>% mutate(fips=as.character(FIPs)) %>% rename_all(function(n){return(ifelse(n=="fips" | n=="Name" | n=="geolevel", n, paste0("rd_",n)))})
rd$missing <- bind_rows(rd) %>% filter(is.na(Name))

#university tech transfer
utt <- list()
utt$state <- read_excel(driver_file, sheet="Univ Tech Transfer_State") %>% mutate(geolevel=1)
utt_all <- bind_rows(utt) %>% filter(!is.na(Name)) %>% mutate(fips=as.character(FIPs)) %>% rename_all(function(n){return(ifelse(n=="fips" | n=="Name" | n=="geolevel", n, paste0("utt_",n)))})
utt$missing <- bind_rows(utt) %>% filter(is.na(Name))

#housing prices
hp <- list()
hp$state <- read_excel(driver_file, sheet="Housing_State") %>% mutate(geolevel=1)
hp_all <- bind_rows(hp) %>% filter(!is.na(Name)) %>% mutate(fips=as.character(FIPS)) %>% rename_all(function(n){return(ifelse(n=="fips" | n=="Name" | n=="geolevel", n, paste0("hp_",n)))})
hp$missing <- bind_rows(hp) %>% filter(is.na(Name))

#broadband
bb <- list()
bb$state <- read_excel(driver_file, sheet="Broadband_State") %>% mutate(geolevel=1) %>% rename(`FIPS Code`=FIPs)
bb$msa <- read_excel(driver_file, sheet="Broadband_MSA") %>% mutate(geolevel=2)
bb$micro <- read_excel(driver_file, sheet="Broadband_Micro") %>% mutate(geolevel=3)
bb$rural <- read_excel(driver_file, sheet="Broadband_Rural") %>% mutate(geolevel=4)
bb_all <- bind_rows(bb) %>% filter(!is.na(Name)) %>% mutate(fips=as.character(`FIPS Code`)) %>% rename_all(function(n){return(ifelse(n=="fips" | n=="Name" | n=="geolevel", n, paste0("bb_",n)))})
bb$missing <- bind_rows(bb) %>% filter(is.na(Name))

drivers <- ai_all %>%
  full_join(ex_all, by=c("fips", "Name", "geolevel")) %>%
  full_join(pop_all, by=c("fips", "Name", "geolevel")) %>%
  full_join(ya_all, by=c("fips", "Name", "geolevel")) %>%
  full_join(edu_all, by=c("fips", "Name", "geolevel")) %>%
  full_join(rd_all, by=c("fips", "Name", "geolevel")) %>%
  full_join(utt_all, by=c("fips", "Name", "geolevel")) %>%
  full_join(hp_all, by=c("fips", "Name", "geolevel")) %>%
  full_join(bb_all, by=c("fips", "Name", "geolevel"))

#saveRDS(outcomes, file="/home/alec/Projects/Brookings/heartland/build/data/md/outcomes.rds")

schema <- function(data=NA, var=NA, label=NA, format=NA, formatAxis=format, startYear=NA, endYear=NA, asjson=FALSE){
  #remove Heartland/Non-Heartland aggregates
  d0 <- data %>% filter(!grepl("^Heartland|^Non", .$Name))
  
  cat("Removed ")
  cat(nrow(data)-nrow(d0))
  cat(" aggregate-level observations\n")
  
  descriptives <- d0 %>% group_by(geolevel) %>% summarise_at(var, funs(mean, min, max, sd, 
                                                         p10=quantile(., 0.1),
                                                         p25=quantile(., 0.25),
                                                         p50=quantile(., 0.5),
                                                         p75=quantile(., 0.75),
                                                         p90=quantile(., 0.9),
                                                         na=sum(is.na(.)),
                                                         n=sum(!is.na(.)),
                                                         .args=list(na.rm=TRUE) ) ) %>%
                                        full_join(tibble(geo=c("state", "metro", "micro", "rural"), geolevel=1:4), ., by="geolevel") %>%
                                        as.data.frame() %>% split(.$geo) %>% 
                                        lapply(function(r){
                                          if(r$n == 0){
                                            return(unbox(NA))
                                          } else{
                                            return(unbox(r))
                                          }
                                        })
  
  #qq <- enquo(var)
  qq <- sym(var)
  
  descriptives$heartland <- data %>% filter(grepl("^Heartland\\s*$", .$Name)) %>% pull(!!qq) %>% unbox()
  descriptives$non_heartland <- data %>% filter(grepl("^Non-Heartland\\s*$", .$Name)) %>% pull(!!qq) %>% unbox()
  
  lookup <- d0 %>% filter(!is.na(!!qq)) %>% 
                   inner_join(tibble(geo=c("state", "metro", "micro", "rural"), geolevel=1:4), ., by="geolevel") %>%
                   split(.$geo) %>% 
                   lapply(function(grp){
                      return(grp %>% select(fips, value=!!qq) %>% spread(fips, value) %>% unbox())
                   })
  
  print(names(lookup));
  
  d <- list()
  d$var <- unbox(var)
  d$label <- unbox(label)
  if(is.na(endYear)){
    d$years <- c(startYear)
    d$period <- unbox(startYear)
  } else{
    d$years <- c(startYear, endYear)
    d$period <- unbox(paste0(startYear,"–",endYear))
  }
  d$format <- unbox(format)
  d$formatAxis <- unbox(formatAxis)
  d$summary <- descriptives
  d$lookup <- lookup
  
  if(asjson){
    return(toJSON(d, digits=5, na="null", pretty=TRUE))
  }
  else{
    return(d)
  }
}
#end schema


#oucomes schema
schema1 <- list()

schema1$map <- list(growth=c("job", "jyf", "gdp"),
                    prosperity=c("awg", "pro", "sol"),
                    inclusion=c("pov", "med", "epo"),
                    trade=c("ai","ex"),
                    human_capital=c("pop","ya","edu"),
                    innovation=c("rd","utt"),
                    infrastructure=c("hp","bb")
                    )



#job TODO: unbox() these props: label, definition, source
schema1$job <- list()
schema1$job$label <- "job" 
schema1$job$definition <- ""
schema1$job$source <- ""
schema1$job$vars <- list()
schema1$job$vars$change <- schema(outcomes, "emp_CAGR_10-17", "Percent change in jobs", format="pct1", formatAxis="pct0", startYear=2010, endYear=2017)
schema1$job$vars$start <- schema(outcomes, "emp_2010", "Jobs", format="num0", startYear=2010)
schema1$job$vars$end <- schema(outcomes, "emp_2017", "Jobs", format="num0", startYear=2017)  

#gdp
schema1$gdp <- list()
schema1$gdp$label <- "GDP"
schema1$gdp$definition <- ""
schema1$gdp$source <- ""
schema1$gdp$vars <- list()
schema1$gdp$vars$change <- schema(outcomes, "gdp_CAGR_10-16", "Percent change in GDP", format="pct1", formatAxis="pct0", startYear=2010, endYear=2016)
schema1$gdp$vars$start <- schema(outcomes, "gdp_2010", "GDP", format="num0", startYear=2010)
schema1$gdp$vars$end <- schema(outcomes, "gdp_2016", "GDP", format="num0", startYear=2016)

#jyf
schema1$jyf <- list()
schema1$jyf$label <- "jyf"
schema1$jyf$definition <- ""
schema1$jyf$source <- ""
schema1$jyf$vars <- list()
schema1$jyf$vars$change <- schema(outcomes, "jyf_CAGR, 2010-16", "Percent change in jobs at young firms", format="pct1", formatAxis="pct0", startYear=2010, endYear=2016)
schema1$jyf$vars$start <- schema(outcomes, "jyf_Employment, 2010:Q1", "Jobs at young firms", format="num0", startYear=2010)
schema1$jyf$vars$end <- schema(outcomes, "jyf_Employment, 2016:Q1", "Jobs at young firms", format="num0", startYear=2016)

#awg
schema1$awg <- list()
schema1$awg$label <- "awg"
schema1$awg$definition <- ""
schema1$awg$source <- ""
schema1$awg$vars <- list()
schema1$awg$vars$change <- schema(outcomes, "avgwage_CAGR_2010-16", "Percent change in average wage", format="pct1", formatAxis="pct0", startYear=2010, endYear=2016)
schema1$awg$vars$start <- schema(outcomes, "avgwage_2010", "Average annual wage", format="doll0", startYear=2010)
schema1$awg$vars$end <- schema(outcomes, "avgwage_2016", "Average annual wage", format="doll0", startYear=2016)


#sol
schema1$sol <- list()
schema1$sol$label <- "sol"
schema1$sol$definition <- ""
schema1$sol$source <- ""
schema1$sol$vars <- list()
schema1$sol$vars$change <- schema(outcomes, "sol_CAGR_10-16", "Percent change in standard of living", format="pct1", formatAxis="pct0", startYear=2010, endYear=2016)
schema1$sol$vars$start <- schema(outcomes, "sol_2010", "Standard of living", format="doll0", startYear=2010)
schema1$sol$vars$end <- schema(outcomes, "sol_2016", "Standard of living", format="doll0", startYear=2016)

#prod
schema1$pro <- list()
schema1$pro$label <- "pro"
schema1$pro$definition <- ""
schema1$pro$source <- ""
schema1$pro$vars <- list()
schema1$pro$vars$change <- schema(outcomes, "prod_CAGR_10-16", "Percent change in productivity", format="pct1", formatAxis="pct0", startYear=2010, endYear=2016)
schema1$pro$vars$start <- schema(outcomes, "prod_2010", "Productivity", format="doll0", startYear=2010)
schema1$pro$vars$end <- schema(outcomes, "prod_2016", "Productivity", format="doll0", startYear=2016)

#med
schema1$med <- list()
schema1$med$label <- "med"
schema1$med$definition <- ""
schema1$med$source <- ""
schema1$med$vars <- list()
schema1$med$vars$change <- schema(outcomes, "medearn_CAGR_10-16", "Percent change in median earnings", format="pct1", formatAxis="pct0", startYear=2010, endYear=2016, asjson=FALSE)
schema1$med$vars$start <- schema(outcomes, "medearn_2010", "Median earnings", format="doll0", startYear=2010)
schema1$med$vars$end <- schema(outcomes, "medearn_2016", "Median earnings", format="doll0", startYear=2016)

#LL <- schema(outcomes, "medearn_CAGR_10-16", "Percent change in median earnings", format="pct1", formatAxis="pct0", startYear=2010, endYear=2016, asjson=FALSE)

#epo
schema1$epo <- list()
schema1$epo$label <- "epo"
schema1$epo$definition <- ""
schema1$epo$source <- ""
schema1$epo$vars <- list()
schema1$epo$vars$change <- schema(outcomes, "epop_2010-16", "Percentage point change in employment to pop. ratio", format="shch1", formatAxis="shch0", startYear=2010, endYear=2016, asjson=FALSE)
schema1$epo$vars$start <- schema(outcomes, "epop_2010", "Emp. to pop. ratio", format="num2", formatAxis = "num1", startYear=2010)
schema1$epo$vars$end <- schema(outcomes, "epop_2016", "Emp. to pop. ratio", format="num2", formatAxis = "num1", startYear=2016)

#pov
schema1$pov <- list()
schema1$pov$label <- "pov"
schema1$pov$definition <- ""
schema1$pov$source <- ""
schema1$pov$vars <- list()
schema1$pov$vars$change <- schema(outcomes, "povrate_2010-16", "Change in poverty rate", format="shch1", formatAxis="shch0", startYear=2010, endYear=2016)
schema1$pov$vars$start <- schema(outcomes, "povrate_2010", "Poverty rate", format="sh1", formatAxis = "sh0", startYear=2010)
schema1$pov$vars$end <- schema(outcomes, "povrate_2016", "Poverty rate", format="sh1", formatAxis = "sh0", startYear=2016)

#drivers

#ai
schema1$ai <- list()
schema1$ai$label <- "ai"
schema1$ai$definition <- ""
schema1$ai$source <- ""
schema1$ai$vars <- list()
schema1$ai$vars$change <- schema(drivers, "ai_CAGR_Emp_10-16", "Percent change in advanced industry employment", format="pct1", formatAxis="pct0", startYear=2010, endYear=2016)
#schema1$ai$vars$start <- schema(drivers, "", "Average annual wage", format="doll0", startYear=2010)
schema1$ai$vars$start <- unbox(NA)
schema1$ai$vars$end <- schema(drivers, "ai_EmpShare_16", "Share of jobs in advanced industries", format="sh1", formatAxis="sh0", startYear=2016)

#exports
schema1$ex <- list()
schema1$ex$label <- "ex"
schema1$ex$definition <- ""
schema1$ex$source <- ""
schema1$ex$vars <- list()
schema1$ex$vars$change <- schema(drivers, "ex_RealExports_CAGR_10-17", "Percent change in exports output", format="pct1", formatAxis="pct0", startYear=2010, endYear=2017)
schema1$ex$vars$start <- unbox(NA)
schema1$ex$vars$end <- schema(drivers, "ex_ExportShare_17", "Export share of output", format="sh1", formatAxis="sh0", startYear=2017)

#pop
schema1$pop <- list()
schema1$pop$label <- "pop"
schema1$pop$definition <- ""
schema1$pop$source <- ""
schema1$pop$vars <- list()
schema1$pop$vars$change <- schema(drivers, "pop_CAGR_2010-17", "Percent change in population", format="pct1", formatAxis="pct0", startYear=2010, endYear=2017)
schema1$pop$vars$start <- unbox(NA)
schema1$pop$vars$end <- schema(drivers, "pop_2017", "Population", format="num0", startYear=2017)

#ya pop
schema1$ya <- list()
schema1$ya$label <- "ya"
schema1$ya$definition <- ""
schema1$ya$source <- ""
schema1$ya$vars <- list()
schema1$ya$vars$change <- schema(drivers, "ya_YAs_CAGR_10-16", "Percent change in young adult population", format="pct1", formatAxis="pct0", startYear=2010, endYear=2016)
schema1$ya$vars$start <- unbox(NA)
schema1$ya$vars$end <- schema(drivers, "ya_YAs_16", "Young adult population", format="num0", startYear=2016)

#edu
schema1$edu <- list()
schema1$edu$label <- "edu"
schema1$edu$definition <- ""
schema1$edu$source <- ""
schema1$edu$vars <- list()
schema1$edu$vars$change <- schema(drivers, "edu_BA_ShareChange_10-16", "Change in BA attainment share", format="shch1", formatAxis="shch0", startYear=2010, endYear=2016)
schema1$edu$vars$start <- unbox(NA)
schema1$edu$vars$end <- schema(drivers, "edu_BA_Share_16", "BA attainment share", format="sh1", formatAxis="sh0", startYear=2016)

#R&D
schema1$rd <- list()
schema1$rd$label <- "rd"
schema1$rd$definition <- ""
schema1$rd$source <- ""
schema1$rd$vars <- list()
schema1$rd$vars$change <- schema(drivers, "rd_CAGR_1015", "Percent change in R&D spending", format="pct1", formatAxis="pct0", startYear=2010, endYear=2015)
schema1$rd$vars$start <- unbox(NA)
schema1$rd$vars$end <- schema(drivers, "rd_RD_ShareGSP_15", "R&D spending share of gross product", format="sh1", formatAxis="sh0", startYear=2015)

#Univ. tech transfer
schema1$utt <- list()
schema1$utt$label <- "utt"
schema1$utt$definition <- ""
schema1$utt$source <- ""
schema1$utt$vars <- list()
schema1$utt$vars$change <- unbox(NA)
schema1$utt$vars$start <- unbox(NA)
schema1$utt$vars$end <- schema(drivers, "utt_Universities_Top100_17", "University tech transfer ranking", format="num0", startYear=2017)

#home prices
schema1$hp <- list()
schema1$hp$label <- "hp"
schema1$hp$definition <- ""
schema1$hp$source <- ""
schema1$hp$vars <- list()
schema1$hp$vars$change <- schema(drivers, "hp_CAGR_10-16", "Percent change in home prices", format="pct1", formatAxis="pct0", startYear=2010, endYear=2016)
schema1$hp$vars$start <- unbox(NA)
schema1$hp$vars$end <- schema(drivers, "hp_2016", "Home prices", format="doll0", startYear=2016)

#broadband
schema1$bb <- list()
schema1$bb$label <- "bb"
schema1$bb$definition <- ""
schema1$bb$source <- ""
schema1$bb$vars <- list()
schema1$bb$vars$change <- unbox(NA)
schema1$bb$vars$start <- unbox(NA)
schema1$bb$vars$end <- schema(drivers, "bb_NoHiSpeed_Share_16", "Share of population without broadband access", format="sh1", formatAxis="sh0", startYear=2016)

JSON <- toJSON(schema1, digits=5, na="null", pretty=TRUE)

writeLines(c("var all_data = ", JSON, ";", "export default all_data;"), "/home/alec/Projects/Brookings/heartland/build/js/all-data.js")


#geo data



#SCRAP

melted <- outcomes %>% filter(!grepl("^Heartland|^Non", .$Name)) %>%
                   select(fips, Name, geolevel, `emp_CAGR_10-17`, `gdp_CAGR_10-16`, `jyf_Share change, 2010-16`,
                   `sol_CAGR_10-16`, `prod_CAGR_10-16`, `avgwage_CAGR_2010-16`, 
                   `medearn_CAGR_10-16`, `epop_EmpPop_Change_10-16`, `povrate_2010-16`) %>% gather("variable", "value", -1:-3)

melted_agg <- outcomes %>% filter(grepl("^Heartland$|^Non-Heartland$", .$Name)) %>%
                        select(fips, Name, geolevel, `emp_CAGR_10-17`, `gdp_CAGR_10-16`, `jyf_Share change, 2010-16`,
                       `sol_CAGR_10-16`, `prod_CAGR_10-16`, `avgwage_CAGR_2010-16`, 
                       `medearn_CAGR_10-16`, `epop_EmpPop_Change_10-16`, `povrate_2010-16`) %>% gather("variable", "value", -1:-3) %>% mutate(geolevel=0)

summ <- melted %>% group_by(geolevel, variable) %>% summarise(m = mean(value, na.rm=TRUE), sd = sd(value, na.rm=TRUE))

gg <- ggplot(melted)

gg + geom_point(aes(x=value, y=1), alpha=0.3, size=0.5) + 
     geom_point(data=melted_agg, aes(x=value, y=1, color=Name)) +
     geom_point(data=melted %>% filter(fips=="17460"), aes(x=value, y=1), color="orange") +
     facet_wrap("variable", ncol=1, scales="free")


scaled <- bind_rows(melted)

scl <- function(v){
  m <- mean(v, na.rm=TRUE)
  s <- sd(v, na.rm=TRUE)
  sc <- (v - m) / s
  return(sc)
}

scaled <- melted %>% group_by(geolevel,variable) %>% mutate(scaled = scl(value), scaled2 = scale(value))

agg <- 

# outcomes <- readRDS(file="/home/alec/Projects/Brookings/heartland/build/data/md/outcomes.rds")




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
