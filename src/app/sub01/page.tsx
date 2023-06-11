// TODO: https://zenn.dev/ttani/articles/nextjs-typescript-serversideprops
import axios from 'axios'
import { Inter } from 'next/font/google'
import { GetServerSideProps } from 'next';
import cheerio from 'cheerio';
import Link from 'next/link';
import React, { ReactElement, JSXElementConstructor, ReactFragment, PromiseLikeOfReactNode, JSX } from 'react';

const inter = Inter({ subsets: ['latin'] })

const titles = [
  'KOF94',
  'KOF95',
  'KOF96',
  'KOF97',
  'KOF98',
  'KOF99',
  'KOF2000',
  'KOF2001',
  'KOF2002',
  'KOF2003',
  '餓狼伝説',
  '餓狼伝説2',
  '餓狼伝説スペシャル',
  '餓狼伝説3',
  'リアルバウト餓狼伝説',
  'リアルバウト餓狼伝説スペシャル',
  'リアルバウト餓狼伝説スペシャル2',
  '餓狼 MARK OF THE WOLVES',
  'サムライスピリッツ',
  '真サムライスピリッツ',
  'サムライスピリッツ 斬紅郎無双剣',
  'サムライスピリッツ 天草降臨',
]

interface TitlePriceInfoProps {
  title: string;
  url: string;
  max: Number;
  min: Number;
  averagePrice: Number;
}

interface PriceData {
  url: string;
  max: Number;
  min: Number;
  averagePrice: Number;
}

export default async function RootLayout() {
  const priceData = await fetchAllPriceInfo();

  return (
    <html lang='en'>
      <body className={inter.className}>
        <ul>
          {priceData.map((item, index) =>
            <li key={index}>
              <TitlePriceInfo
                title={titles[index]}
                url={item.url}
                max={item.max}
                min={item.min}
                averagePrice={item.averagePrice}
              />
            </li>)
          }
        </ul>
      </body>
    </html>
  )
}

const fetchAllPriceInfo = async () => {
  const fetchTasks: Promise<PriceData>[] = []
  const info: PriceData[] = [];

  for (let i=0; i < titles.length; i++) {
    fetchTasks.push(fetchPriceDataOnYahooAuction(titles[i]));
  }
  const results = await Promise.all(fetchTasks);
  results.forEach((value) => {
    info.push(value);
  })

  return info;
}

const TitlePriceInfo: React.FC<TitlePriceInfoProps> = (props: TitlePriceInfoProps) => {
  return (
    <>
      {props.title}/
      max: {props.max}/
      min: {props.min}/
      average: {props.averagePrice}/
      <a href={props.url}>Go to auction page</a>
    </>
  )
}

const fetchYahooAuctionHtml = async (title: string) => {
  const url = `https://auctions.yahoo.co.jp/closedsearch/closedsearch/${title}%20neogeo%20-CD/2084005537/`
  try {
    const html = await (await axios.get(url)).data;
    return {
      url,
      html,
    }
  } catch (e) {
    throw Error(`Failed to fetch data from ${url}`);
  }
}

const fetchPriceDataOnYahooAuction = async (title: string): Promise<PriceData> => {
  return fetchYahooAuctionHtml(title).then(data => {
    const $ = cheerio.load(data.html);

    const priceDetailChildren = $('.SearchMode__priceDetail').children();
    const priceTags = priceDetailChildren.filter('a');

    const minPrice = $(priceTags[0]).text().replace('円', '').replace(',', '');
    const maxPrice = $(priceTags[1]).text().replace('円', '').replace(',', '');
    const averagePrice = $(priceTags[2]).text().replace('円', '').replace(',', '');

    // console.log('最安価格:', minPrice);
    // console.log('最高価格:', maxPrice);
    // console.log('平均価格:', averagePrice);

    return {
      url: data.url,
      max: Number(maxPrice),
      min: Number(minPrice),
      averagePrice: Number(averagePrice),
    };
  }).catch(e => {
    console.log(`Error - ${e}`)
    return {
      url: "-",
      max: 0,
      min: 0,
      averagePrice: 0,
    };
  });
}