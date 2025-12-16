/**
 * Knowledge Injection Service (RAG)
 * Retrieves agent-specific knowledge and injects relevant chunks into AI prompt
 */

import { db } from '../db';
import { eq, sql, and, or, desc } from 'drizzle-orm';
import { knowledgeBase, type KnowledgeBase } from '@shared/schema';

export interface KnowledgeChunk {
  id: string;
  title: string;
  content: string;
  source?: string;
  relevanceScore: number;
}

export interface RAGResult {
  chunks: KnowledgeChunk[];
  combinedContext: string;
  totalChunks: number;
}

export class KnowledgeInjection {
  private readonly MAX_CONTEXT_LENGTH = 3000; // chars
  private readonly MAX_CHUNKS = 5;

  /**
   * Search and retrieve relevant knowledge for a query
   */
  async getRelevantKnowledge(
    agentId: string,
    query: string,
    options?: {
      maxChunks?: number;
      maxContextLength?: number;
    }
  ): Promise<RAGResult> {
    const maxChunks = options?.maxChunks || this.MAX_CHUNKS;
    const maxContextLength = options?.maxContextLength || this.MAX_CONTEXT_LENGTH;

    // Extract key terms from query
    const keywords = this.extractKeywords(query);

    if (keywords.length === 0) {
      return { chunks: [], combinedContext: '', totalChunks: 0 };
    }

    // Build search conditions
    const searchConditions = keywords.map(keyword => 
      or(
        sql`LOWER(${knowledgeBase.content}) LIKE LOWER(${`%${keyword}%`})`,
        sql`LOWER(${knowledgeBase.title}) LIKE LOWER(${`%${keyword}%`})`
      )
    );

    // Search knowledge base
    const results = await db
      .select()
      .from(knowledgeBase)
      .where(
        and(
          eq(knowledgeBase.agentId, agentId),
          or(...searchConditions)
        )
      )
      .limit(maxChunks * 2); // Get more than needed for scoring

    if (results.length === 0) {
      return { chunks: [], combinedContext: '', totalChunks: 0 };
    }

    // Score and rank results
    const scoredResults = results.map(result => ({
      ...result,
      relevanceScore: this.calculateRelevance(result, keywords),
    }));

    // Sort by relevance
    scoredResults.sort((a, b) => b.relevanceScore - a.relevanceScore);

    // Take top results that fit within context length
    const selectedChunks: KnowledgeChunk[] = [];
    let totalLength = 0;

    for (const result of scoredResults) {
      if (selectedChunks.length >= maxChunks) break;
      if (totalLength + result.content.length > maxContextLength) continue;

      selectedChunks.push({
        id: result.id,
        title: result.title || 'Information',
        content: result.content,
        source: result.sourceUrl || undefined,
        relevanceScore: result.relevanceScore,
      });

      totalLength += result.content.length;
    }

    // Build combined context
    const combinedContext = this.buildContext(selectedChunks);

    return {
      chunks: selectedChunks,
      combinedContext,
      totalChunks: results.length,
    };
  }

  /**
   * Get knowledge by specific section/topic
   */
  async getKnowledgeBySection(
    agentId: string,
    section: string
  ): Promise<KnowledgeChunk[]> {
    const results = await db
      .select()
      .from(knowledgeBase)
      .where(
        and(
          eq(knowledgeBase.agentId, agentId),
          eq(knowledgeBase.section, section)
        )
      )
      .orderBy(desc(knowledgeBase.createdAt))
      .limit(this.MAX_CHUNKS);

    return results.map(r => ({
      id: r.id,
      title: r.title || section,
      content: r.content,
      source: r.sourceUrl || undefined,
      relevanceScore: 1.0,
    }));
  }

  /**
   * Get FAQ-style quick answers
   */
  async getQuickAnswer(
    agentId: string,
    question: string
  ): Promise<string | null> {
    // Look for exact or near-exact matches
    const keywords = this.extractKeywords(question);
    
    const results = await db
      .select()
      .from(knowledgeBase)
      .where(
        and(
          eq(knowledgeBase.agentId, agentId),
          eq(knowledgeBase.contentType, 'faq')
        )
      )
      .limit(10);

    // Score each FAQ
    let bestMatch: KnowledgeBase | null = null;
    let bestScore = 0;

    for (const result of results) {
      const score = this.calculateRelevance(result, keywords);
      if (score > bestScore && score > 0.5) {
        bestScore = score;
        bestMatch = result;
      }
    }

    return bestMatch?.content || null;
  }

  /**
   * Get all knowledge summaries for an agent
   */
  async getKnowledgeSummary(agentId: string): Promise<{
    totalEntries: number;
    sections: string[];
    contentTypes: string[];
  }> {
    const entries = await db
      .select({
        section: knowledgeBase.section,
        contentType: knowledgeBase.contentType,
      })
      .from(knowledgeBase)
      .where(eq(knowledgeBase.agentId, agentId));

    const sections = Array.from(new Set(entries.map(e => e.section).filter(Boolean))) as string[];
    const contentTypes = Array.from(new Set(entries.map(e => e.contentType).filter(Boolean))) as string[];

    return {
      totalEntries: entries.length,
      sections,
      contentTypes,
    };
  }

  /**
   * Extract keywords from query
   */
  private extractKeywords(query: string): string[] {
    // Common stop words to filter out
    const stopWords = new Set([
      'i', 'me', 'my', 'we', 'our', 'you', 'your', 'the', 'a', 'an',
      'is', 'are', 'was', 'were', 'be', 'been', 'being',
      'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would', 'could', 'should',
      'what', 'when', 'where', 'which', 'who', 'whom', 'why', 'how',
      'this', 'that', 'these', 'those', 'can', 'may', 'must', 'shall',
      'to', 'of', 'in', 'for', 'on', 'with', 'at', 'by', 'from',
      'about', 'into', 'through', 'during', 'before', 'after',
      'and', 'but', 'or', 'not', 'if', 'then', 'else', 'than',
      'want', 'need', 'like', 'please', 'thanks', 'thank', 'hi', 'hello'
    ]);

    // Extract words, filter stop words, and get unique keywords
    const words = query
      .toLowerCase()
      .replace(/[^\w\s]/g, ' ')
      .split(/\s+/)
      .filter(word => word.length > 2 && !stopWords.has(word));

    return Array.from(new Set(words));
  }

  /**
   * Calculate relevance score for a knowledge entry
   */
  private calculateRelevance(
    entry: KnowledgeBase,
    keywords: string[]
  ): number {
    if (keywords.length === 0) return 0;

    const content = (entry.content || '').toLowerCase();
    const title = (entry.title || '').toLowerCase();
    
    let score = 0;
    let matchedKeywords = 0;

    for (const keyword of keywords) {
      const keywordLower = keyword.toLowerCase();
      
      // Title match is weighted higher
      if (title.includes(keywordLower)) {
        score += 0.3;
        matchedKeywords++;
      }
      
      // Content match
      if (content.includes(keywordLower)) {
        // Count occurrences (capped at 5)
        const occurrences = Math.min(5, (content.match(new RegExp(keywordLower, 'g')) || []).length);
        score += 0.1 * occurrences;
        matchedKeywords++;
      }
    }

    // Normalize by keyword count
    const normalizedScore = (score / keywords.length) * (matchedKeywords / keywords.length);
    
    return Math.min(1, normalizedScore);
  }

  /**
   * Build combined context string from chunks
   */
  private buildContext(chunks: KnowledgeChunk[]): string {
    if (chunks.length === 0) return '';

    return chunks
      .map((chunk, index) => {
        let context = '';
        if (chunk.title) {
          context += `[${chunk.title}]\n`;
        }
        context += chunk.content;
        return context;
      })
      .join('\n\n---\n\n');
  }

  /**
   * Semantic search using embeddings (future enhancement)
   * For now, falls back to keyword search
   */
  async semanticSearch(
    agentId: string,
    query: string,
    maxResults: number = 5
  ): Promise<KnowledgeChunk[]> {
    // TODO: Implement vector embeddings for semantic search
    // For now, use keyword search
    const result = await this.getRelevantKnowledge(agentId, query, {
      maxChunks: maxResults,
    });
    return result.chunks;
  }
}

// Export singleton instance
export const knowledgeInjection = new KnowledgeInjection();
