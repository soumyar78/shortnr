FactoryBot.define do
  factory :bio_profile do
    association :user
    sequence(:username) { |n| "profile#{n}" }
    bio { "This is my link-in-bio page!" }
    avatar_url { nil }
  end
end
