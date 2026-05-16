import Link from 'next/link';

export type HomeLiveCardItem = {
  title: string;
  author: string;
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
        <div className="projects_overlay hide-tablet">
          <div className="news_btn">
            <div>Məqaləni oxu</div>
          </div>
        </div>
      </div>
      <div className="news-header_middle-content-wrap">
        <div className="news_middle-content">
          <div className="news_specs-wrap">
            <div className="news_category-label">
              <div>{item.category}</div>
            </div>
            <div>{item.date}</div>
          </div>
          <h2 className="live_title no-animate">{item.title}</h2>
        </div>
        <div className="news_author-wrap hide-landscape">
          <div>{item.author}</div>
        </div>
      </div>
    </Link>
  </div>
);
