package com.korea.test.service;

import java.util.List;

import org.springframework.stereotype.Service;

import com.korea.test.dto.BookDTO;
import com.korea.test.entity.BookEntity;
import com.korea.test.repository.BookRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class BookService {

    private final BookRepository bookRepository;

    public BookDTO create(BookDTO dto) {

        BookEntity entity = BookEntity.builder()
                .title(dto.getTitle())
                .author(dto.getAuthor())
                .price(dto.getPrice())
                .category(dto.getCategory())
                .stock(dto.getStock())
                .build();

        BookEntity savedEntity = bookRepository.save(entity);

        return new BookDTO(savedEntity);
    }

    public List<BookDTO> findAll() {

        return bookRepository.findAll()
                .stream()
                .map(BookDTO::new)
                .toList();
    }
    
    public BookDTO findById(Long id) {

        BookEntity entity = bookRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("도서를 찾을 수 없습니다."));

        return new BookDTO(entity);
    }
    
    public List<BookDTO> findByTitle(String title){

        return bookRepository.findByTitle(title)
                .stream()
                .map(BookDTO::new)
                .toList();
    }
    
    public List<BookDTO> findByCategory(String category){

        return bookRepository.findByCategory(category)
                .stream()
                .map(BookDTO::new)
                .toList();
    }
    
    public BookDTO update(Long id, BookDTO dto){

        BookEntity entity = bookRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("도서를 찾을 수 없습니다."));

        entity.setTitle(dto.getTitle());
        entity.setAuthor(dto.getAuthor());
        entity.setPrice(dto.getPrice());
        entity.setCategory(dto.getCategory());
        entity.setStock(dto.getStock());

        BookEntity saved = bookRepository.save(entity);

        return new BookDTO(saved);
    }
    
    public void delete(Long id){

        bookRepository.deleteById(id);
    }
}