package com.korea.test.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.korea.test.entity.BookEntity;

public interface BookRepository extends JpaRepository<BookEntity, Long> {

    List<BookEntity> findByTitle(String title);

    List<BookEntity> findByCategory(String category);
}