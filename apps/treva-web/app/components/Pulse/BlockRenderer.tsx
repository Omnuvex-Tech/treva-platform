"use client";

/* eslint-disable @next/next/no-img-element */
import React from "react";
import type { ArticleBlock } from "@/lib/pulse-api";
import { toAbsUrl } from "@/lib/pulse-api";

type BlockRendererProps = {
    blocks: ArticleBlock[];
};

export function BlockRenderer({ blocks }: BlockRendererProps) {
    return (
        <>
            {blocks.map((block, index) => {
                switch (block.type) {
                    case "heading":
                        if (block.level === 3) {
                            return (
                                <h3 key={index} className="heading-style-h3" style={{ marginTop: "2rem", marginBottom: "1rem" }}>
                                    <strong>{block.text}</strong>
                                </h3>
                            );
                        }
                        return (
                            <h2 key={index} className="heading-style-h2" style={{ marginTop: "2.5rem", marginBottom: "1rem" }}>
                                <strong>{block.text}</strong>
                            </h2>
                        );

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
                        return (
                            <ul key={index} role="list" style={{ marginBottom: "1rem", paddingLeft: "1.5rem" }}>
                                {block.items.map((item, itemIdx) => (
                                    <li key={itemIdx} dangerouslySetInnerHTML={{ __html: item }} />
                                ))}
                            </ul>
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

                    case "gallery":
                        return (
                            <div
                                key={index}
                                style={{
                                    display: "flex",
                                    gap: "0.5rem",
                                    overflowX: "auto",
                                    margin: "2rem 0",
                                    paddingBottom: "0.5rem",
                                }}
                            >
                                {block.images.map((img, imgIdx) => (
                                    <div
                                        key={imgIdx}
                                        style={{
                                            flex: "0 0 auto",
                                            width: "80%",
                                            maxWidth: "600px",
                                            overflow: "hidden",
                                            borderRadius: "0.5rem",
                                        }}
                                    >
                                        <img
                                            src={toAbsUrl(img.url)}
                                            alt={img.alt}
                                            loading="lazy"
                                            style={{ width: "100%", height: "auto", display: "block" }}
                                        />
                                    </div>
                                ))}
                            </div>
                        );

                    default:
                        return null;
                }
            })}
        </>
    );
}
