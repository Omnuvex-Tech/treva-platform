"use client";

/* eslint-disable @next/next/no-img-element */
import React, { useState } from "react";
import type { ArticleBlock } from "@/lib/pulse-api";
import { toAbsUrl } from "@/lib/pulse-api";

type BlockRendererProps = {
    blocks: ArticleBlock[];
};

function GalleryCarousel({ images }: { images: { url: string; alt: string }[] }) {
    const [current, setCurrent] = useState(0);
    const [hover, setHover] = useState(false);
    const total = images.length;
    const prev = () => setCurrent(c => (c === 0 ? total - 1 : c - 1));
    const next = () => setCurrent(c => (c === total - 1 ? 0 : c + 1));
    const img = images[current];
    if (total === 0 || !img) return null;
    return (
        <div style={{ margin: "2rem 0" }}>
            <div style={{
                position: "relative", width: "100%", maxWidth: 800, margin: "0 auto",
                overflow: "hidden", borderRadius: "0.5rem",
            }}>
                <img src={toAbsUrl(img.url)} alt={img.alt} loading="lazy"
                    style={{ width: "100%", height: "auto", display: "block" }}
                    onError={e => { (e.target as HTMLImageElement).style.display = "none"; }}
                />
            </div>
            <div style={{
                display: "flex", alignItems: "center", justifyContent: "space-between",
                maxWidth: 800, margin: "0.75rem auto 0", padding: "0 4px",
            }}>
                <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                    {images.map((_, i) => (
                        <button key={i} onClick={() => setCurrent(i)}
                            style={{
                                width: 10, height: 10, borderRadius: "50%", border: "none",
                                cursor: "pointer", padding: 0,
                                background: i === current ? "#4C525E" : "#E4E4E4",
                                transition: "background 0.2s",
                            }} aria-label={`Şəkil ${i + 1}`}
                        />
                    ))}
                </div>
                <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
                    <button onClick={prev}
                        style={{
                            border: "none", cursor: "pointer", background: "none",
                            fontSize: 32, lineHeight: 1, padding: 0,
                            color: hover ? "#4C525E" : "#C9C9C9",
                            transition: "color 0.2s",
                        }}
                        onMouseEnter={() => setHover(true)}
                        onMouseLeave={() => setHover(false)}
                        aria-label="Əvvəlki şəkil"
                    >‹</button>
                    <button onClick={next}
                        style={{
                            border: "none", cursor: "pointer", background: "none",
                            fontSize: 32, lineHeight: 1, padding: 0,
                            color: hover ? "#4C525E" : "#C9C9C9",
                            transition: "color 0.2s",
                        }}
                        onMouseEnter={() => setHover(true)}
                        onMouseLeave={() => setHover(false)}
                        aria-label="Növbəti şəkil"
                    >›</button>
                </div>
            </div>
        </div>
    );
}

export function BlockRenderer({ blocks }: BlockRendererProps) {
    return (
        <>
            {blocks.map((block, index) => {
                switch (block.type) {
                    case "heading": {
                        const Tag = `h${block.level}` as "h1" | "h2" | "h3" | "h4" | "h5" | "h6";
                        const marginTop = block.level <= 2 ? "2.5rem" : "2rem";
                        const className = `heading-style-h${block.level}`;
                        return (
                            <Tag key={index} className={className} style={{ marginTop, marginBottom: "1rem" }}>
                                <strong>{block.text}</strong>
                            </Tag>
                        );
                    }

                    case "paragraph":
                        return (
                            <p
                                key={index}
                                style={{ marginBottom: "1rem", lineHeight: 1.7 }}
                                dangerouslySetInnerHTML={{ __html: block.text }}
                            />
                        );

                    case "image":
                        return (
                            <figure
                                key={index}
                                style={{ maxWidth: "1672px" }}
                                className="w-richtext-align-fullwidth w-richtext-figure-type-image"
                            >
                                <div>
                                    <img
                                        alt={block.alt}
                                        src={toAbsUrl(block.url)}
                                        loading="lazy"
                                        onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                                    />
                                </div>
                                {block.caption && (
                                    <figcaption style={{ fontSize: "0.875rem", color: "#888", marginTop: "0.5rem" }}>
                                        {block.caption}
                                    </figcaption>
                                )}
                            </figure>
                        );

                    case "list":
                        const ListTag = block.ordered ? "ol" : "ul";
                        return (
                            <ListTag key={index} role="list" style={{
                                marginBottom: "1rem", paddingLeft: "1.5rem",
                                listStyleType: block.ordered ? "decimal" : "disc"
                            }}>
                                {block.items.map((item, itemIdx) => (
                                    <li key={itemIdx} dangerouslySetInnerHTML={{ __html: item }} />
                                ))}
                            </ListTag>
                        );

                    case "faq":
                        return (
                            <div key={index} style={{ marginTop: "2rem", marginBottom: "1rem" }}>
                                <h2 className="heading-style-h2" style={{ marginBottom: "0.5rem" }}>
                                    <strong>{block.question}</strong>
                                </h2>
                                <p style={{ lineHeight: 1.7 }}>{block.answer}</p>
                            </div>
                        );

                    case "quote":
                        return (
                            <blockquote
                                key={index}
                                style={{
                                    borderLeft: "3px solid #ccc",
                                    paddingLeft: "1.5rem",
                                    margin: "2rem 0",
                                    fontStyle: "italic",
                                    color: "#555",
                                }}
                            >
                                <p>{block.text}</p>
                                {block.author && (
                                    <cite style={{ display: "block", marginTop: "0.5rem", fontStyle: "normal", fontSize: "0.875rem", color: "#888" }}>
                                        — {block.author}
                                    </cite>
                                )}
                            </blockquote>
                        );

                    case "video":
                        return (
                            <div key={index} style={{ position: "relative", paddingBottom: "56.25%", height: 0, overflow: "hidden", margin: "2rem 0", borderRadius: "0.5rem" }}>
                                <iframe
                                    src={block.url}
                                    style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "100%", border: 0 }}
                                    allowFullScreen
                                    loading="lazy"
                                />
                            </div>
                        );

                    case "gallery": {
                        return <GalleryCarousel key={index} images={block.images} />;
                    }

                    default:
                        return null;
                }
            })}
        </>
    );
}
