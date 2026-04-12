"use client";
import { motion } from "framer-motion";
import { Eye, Heart, ArrowRight } from "lucide-react";

export default function ArticleCard({ post }: any) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      whileHover={{ y: -4 }}
      className="group bg-white border border-gray-100 p-10 rounded-[2rem] shadow-[0_4px_20px_rgba(0,0,0,0.03)] hover:shadow-[0_20px_40px_rgba(0,0,0,0.06)] transition-all duration-500 cursor-pointer"
    >
      <div className="flex justify-between items-center mb-6">
        <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-blue-500">
          {post.category}
        </span>
        <div className="flex gap-4 text-gray-300">
          <span className="flex items-center gap-1.5 text-[11px]"><Eye size={14} /> {post.views}</span>
          <span className="flex items-center gap-1.5 text-[11px]"><Heart size={14} /> {post.likes}</span>
        </div>
      </div>

      <h2 className="text-3xl font-serif font-medium leading-tight text-gray-900 group-hover:text-blue-600 transition-colors">
        {post.title}
      </h2>
      
      <p className="mt-4 text-gray-500 leading-relaxed text-lg line-clamp-2">
        {post.excerpt}
      </p>

      <div className="mt-8 flex items-center text-sm font-semibold text-gray-900">
        <span className="mr-2">Read Reflection</span>
        <motion.div animate={{ x: [0, 5, 0] }} transition={{ repeat: Infinity, duration: 1.5 }}>
          <ArrowRight size={16} />
        </motion.div>
      </div>
    </motion.div>
  );
}