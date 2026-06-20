class CreateShortLinks < ActiveRecord::Migration[8.0]
  def change
    create_table :short_links do |t|
      t.references :user, null: true, foreign_key: true
      t.text :original_url, null: false
      t.string :slug, null: false
      t.integer :click_count, null: false, default: 0

      t.timestamps
    end
    add_index :short_links, :slug, unique: true
  end
end

