FactoryBot.define do
  factory :bio_link do
    association :bio_profile
    title { "GitHub Profile" }
    url { "https://github.com/somedev" }
    sequence(:position) { |n| n }
  end
end
