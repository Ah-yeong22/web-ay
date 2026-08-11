package com.korea.test.controller;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.korea.test.dto.BookDTO;
import com.korea.test.service.BookService;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/books")
@RequiredArgsConstructor
public class BookController {

    private final BookService bookService;
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                             
    // 도서 등록
    @PostMapping
    public ResponseEntity<String> create(@RequestBody BookDTO dto) {

        bookService.create(dto);

        return ResponseEntity.ok("완료");
    }

    // 전체 도서 조회
    @GetMapping
    public ResponseEntity<List<BookDTO>> findAll() {

        List<BookDTO> result = bookService.findAll();

        return ResponseEntity.ok(result);
    }
    
    //id로 도서 조회 
    @GetMapping("/{id}")
    public ResponseEntity<BookDTO> findById(@PathVariable Long id) {

        BookDTO result = bookService.findById(id);

        return ResponseEntity.ok(result);
    }
    
    @GetMapping("/search")
    public ResponseEntity<List<BookDTO>> findByTitle(	
            @RequestParam(name = "title") String title) {

        return ResponseEntity.ok(bookService.findByTitle(title));
    }
    
    @GetMapping("/category")
    public ResponseEntity<List<BookDTO>> findByCategory(
            @RequestParam String category){

        return ResponseEntity.ok(bookService.findByCategory(category));
    }
       
    @PutMapping("/{id}")
    public ResponseEntity<BookDTO> update(
            @PathVariable Long id,
            @RequestBody BookDTO dto){

        return ResponseEntity.ok(bookService.update(id, dto));
    }
    
    @DeleteMapping("/{id}")
    public ResponseEntity<String> delete(
            @PathVariable Long id){

        bookService.delete(id);

        return ResponseEntity.ok("삭제 완료");
    }
}