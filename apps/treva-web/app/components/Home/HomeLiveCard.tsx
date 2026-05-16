import Link from 'next/link';
import { ReadMoreOverlay } from '../ReadMoreOverlay';

export type HomeLiveCardItem = {
  title: string;
  author: string;
  authorImg?: string;
  category: string;
  date: string;
  img: string;
  link: string;
};

type HomeLiveCardProps = {
  item: HomeLiveCardItem;
};

export const HomeLiveCard = ({ item }: HomeLiveCardProps) => (
  <div role="listitem" className="w-dyn-item">
    <Link href={`pulse/${item.link}`} className="live_link w-inline-block">
      <div className="news_middle-img-wrap is-carousel">
        <div className="news_middle-img-holder">
          <img src={item.img} loading="lazy" alt={item.title} className="fullwidth-img" />
        </div>
        <ReadMoreOverlay />
      </div>
      <div className="news-header_middle-content-wrap">
        <div className="news_middle-content">
          <div className="news_specs-wrap">
            <div className="news_category-label">
              <div>{item.category}</div>
            </div>
            <div>{item.date}</div>
          </div>
          <h3 className="live_title no-animate">{item.title}</h3>
        </div>
        <div className="news_author-wrap hide-landscape">
          {item.authorImg && (
            <div className="news_author-headshot">
              <img src={item.authorImg} alt={item.author} className="news_author-headshot-img" />
            </div>
          )}
          <div className="news_author-name">{item.author}</div>
        </div>
      </div>
    </Link>
  </div>
);
