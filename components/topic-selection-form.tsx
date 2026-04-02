"use client";

import { useMemo, useState } from "react";

type Topic = {
  id: number;
  name: string;
  slug: string;
  description: string | null;
};

type Props = {
  gradeId: number;
  wholeNumberTopics: Topic[];
  decimalTopics: Topic[];
  fractionTopics: Topic[];
};

export default function TopicSelectionForm({
  gradeId,
  wholeNumberTopics,
  decimalTopics,
  fractionTopics,
}: Props) {
  const [selectedTopicIds, setSelectedTopicIds] = useState<number[]>([]);

  const isAtLimit = selectedTopicIds.length >= 4;

  function toggleTopic(topicId: number, checked: boolean) {
    setSelectedTopicIds((prev) => {
      if (checked) {
        if (prev.includes(topicId) || prev.length >= 4) return prev;
        return [...prev, topicId];
      }

      return prev.filter((id) => id !== topicId);
    });
  }

  const hasSelection = selectedTopicIds.length > 0;

  const helperText = useMemo(() => {
    if (selectedTopicIds.length === 4) {
      return "You have selected the maximum of 4 topics.";
    }
    return `You can select up to 4 topics. Currently selected: ${selectedTopicIds.length}`;
  }, [selectedTopicIds.length]);

  return (
    <form action="/worksheets/mixed" method="get" className="space-y-6">
      <input type="hidden" name="gradeId" value={gradeId} />

      <div>
        <label className="block text-sm font-medium mb-2">Difficulty</label>
        <select
          name="difficulty"
          className="border rounded px-3 py-2 text-sm"
          defaultValue="easy"
        >
          <option value="easy">Easy</option>
          <option value="medium">Medium</option>
          <option value="hard">Hard</option>
        </select>
      </div>

      <p className="text-sm text-gray-600">{helperText}</p>

      <div className="grid gap-6 xl:grid-cols-3 md:grid-cols-2">
        <TopicSection
          title="Whole Numbers"
          topics={wholeNumberTopics}
          selectedTopicIds={selectedTopicIds}
          onToggle={toggleTopic}
          isAtLimit={isAtLimit}
        />

        <TopicSection
          title="Decimals"
          topics={decimalTopics}
          selectedTopicIds={selectedTopicIds}
          onToggle={toggleTopic}
          isAtLimit={isAtLimit}
        />

        <TopicSection
          title="Fractions"
          topics={fractionTopics}
          selectedTopicIds={selectedTopicIds}
          onToggle={toggleTopic}
          isAtLimit={isAtLimit}
        />
      </div>

      <button
        type="submit"
        disabled={!hasSelection}
        className="rounded bg-black text-white px-4 py-2 text-sm disabled:opacity-50 disabled:cursor-not-allowed"
      >
        Generate Worksheet
      </button>
    </form>
  );
}

function TopicSection({
  title,
  topics,
  selectedTopicIds,
  onToggle,
  isAtLimit,
}: {
  title: string;
  topics: Topic[];
  selectedTopicIds: number[];
  onToggle: (topicId: number, checked: boolean) => void;
  isAtLimit: boolean;
}) {
  if (topics.length === 0) return null;

  return (
    <section>
      <h3 className="text-lg font-semibold mb-2">{title}</h3>
      <div className="space-y-2">
        {topics.map((topic) => {
          const checked = selectedTopicIds.includes(topic.id);
          const disabled = !checked && isAtLimit;

          return (
            <label
              key={topic.id}
              className={`flex items-start gap-3 border rounded p-3 ${
                disabled ? "opacity-50" : ""
              }`}
            >
              <input
                type="checkbox"
                name="topicIds"
                value={topic.id}
                checked={checked}
                disabled={disabled}
                onChange={(e) => onToggle(topic.id, e.target.checked)}
                className="mt-1"
              />
              <div>
                <div className="font-medium">{topic.name}</div>
                {topic.description ? (
                  <div className="text-sm text-gray-600">
                    {topic.description}
                  </div>
                ) : null}
              </div>
            </label>
          );
        })}
      </div>
    </section>
  );
}