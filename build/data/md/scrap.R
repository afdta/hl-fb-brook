library(tidyverse, ggplot2, sf)
cbsa2 <- readRDS("/home/alec/Projects/Brookings/heartland/build/data/md/cbsa2.rds")

names(cbsa2)
 
gg <- ggplot(cbsa2)

gg + geom_sf(aes(fill=`emp_CAGR_10-17`)) + scale_fill_gradient2()
