import 'babel-polyfill';
import Nightmare from "nightmare";
require('nightmare-evaluate-async')(Nightmare)
import path from "path";
import NightmareCrawler from "./nightmare-crawler";

const nightmare = new Nightmare({ show:true, openDevTools:true });
nightmare
  .goto("http://qiita.com/katsukii/items/e4fd4f885a9c9d87ec93")
  .evaluateAsync(() => new Promise(resolve => {
    setTimeout(() => resolve(1), 1000);
  }))
  .end()
  .then(v => console.log(1));
