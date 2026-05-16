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
  <div role="listitem" className="home-live-card-item w-dyn-item">
    <Link href={`pulse/${item.link}`} className="live_link home-live-card-link w-inline-block">
      <div className="news_middle-img-wrap home-live-card-image-wrap is-carousel">
        <div className="news_middle-img-holder home-live-card-image-holder">
          <img src={item.img} loading="lazy" alt={item.title} className="fullwidth-img home-live-card-image" />
        </div>
        <ReadMoreOverlay />
      </div>
      <div className="news-header_middle-content-wrap home-live-card-content-wrap">
        <div className="news_middle-content home-live-card-content">
          <div className="news_specs-wrap home-live-card-meta">
            <div className="news_category-label home-live-card-category">
              <div className="home-live-card-category-text">{item.category}</div>
            </div>
            <div className="home-live-card-date">{item.date}</div>
          </div>
          <h3 className="live_title home-live-card-title no-animate">{item.title}</h3>
        </div>
        <div className="news_author-wrap home-live-card-author-wrap hide-landscape">
          {item.authorImg && (
            <div className="news_author-headshot home-live-card-author-image-wrap">
              <img src={item.authorImg} alt={item.author} className="news_author-headshot-img home-live-card-author-image" />
            </div>
          )}
          <div className="news_author-name home-live-card-author-name">{item.author}</div>
        </div>
      </div>
    </Link>
  </div>
);
