FactoryBot.define do
  factory :short_link do
    association :user
    original_url { "https://google.com/search?q=rails" }
    sequence(:slug) { |n| "glink#{n}" }
    click_count { 0 }
  end
end
