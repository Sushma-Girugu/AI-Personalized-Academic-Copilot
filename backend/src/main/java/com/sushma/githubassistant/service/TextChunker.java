package com.sushma.githubassistant.service;

import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;

@Service
public class TextChunker {

    private static final int CHUNK_SIZE = 1000;
    private static final int OVERLAP = 200;

    public List<String> splitText(String text) {

        List<String> chunks = new ArrayList<>();

        if (text == null || text.trim().isEmpty()) {
            return chunks;
        }

        int start = 0;

        while (start < text.length()) {

            int end = Math.min(start + CHUNK_SIZE, text.length());

            String chunk = text.substring(start, end).trim();

            if (!chunk.isEmpty()) {
                chunks.add(chunk);
            }

            if (end == text.length()) {
                break;
            }

            start = end - OVERLAP;
        }

        return chunks;
    }
}