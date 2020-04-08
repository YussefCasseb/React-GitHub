/* eslint-disable no-shadow */
/* eslint-disable no-throw-literal */
/* eslint-disable camelcase */
/* eslint-disable no-restricted-syntax */
/* eslint-disable react/state-in-constructor */
import React, { Component } from 'react';
import { FaGithubAlt, FaPlus, FaSpinner, FaListAlt } from 'react-icons/fa';
import { Link } from 'react-router-dom';

import api from '../../services/api';

import { Container, Form, SubmitButton, List } from './style';

export default class Main extends Component {
  state = {
    gitUser: '',
    repositories: [],
    loading: false,
    error: false,
  };

  componentDidMount() {
    const repositories = localStorage.getItem('repositories');

    if (repositories) {
      this.setState({ repositories: JSON.parse(repositories) });
    }
  }

  componentDidUpdate(_, prevState) {
    const { repositories } = this.state;

    if (prevState.repositories !== repositories) {
      localStorage.setItem('repositories', JSON.stringify(repositories));
    }
  }

  handleInputChange = (e) => {
    this.setState({ gitUser: e.target.value });
  };

  handleSubmit = async (e) => {
    e.preventDefault();

    this.setState({ loading: true, error: false });

    try {
      const { gitUser, repositories } = this.state;

      if (gitUser === '') throw alert('Você precisa informar um Usuário');

      const user = repositories.find((r) => r.login === gitUser);

      if (user) throw alert('Já foram listados os Repositórios desse Usuário');

      const response = await api.get(`/users/${gitUser}/repos?per_page=10000`);

      if (response.data.length > 0) {
        for (const repo of response.data) {
          const { repositories } = this.state;

          const {
            name,
            owner: { login },
          } = repo;

          const data = {
            login,
            name,
            url: `${login}/${name}`,
          };

          this.setState({ repositories: [...repositories, data], gitUser: '' });
        }
      }
    } catch (error) {
      this.setState({ error: true });
    } finally {
      this.setState({ loading: false });
    }
  };

  render() {
    const { gitUser, loading, repositories, error } = this.state;
    return (
      <Container>
        <h1>
          <FaGithubAlt />
          Busca de Repositórios
        </h1>

        <Form onSubmit={this.handleSubmit} error={error}>
          <input
            type="text"
            placeholder="Informe um Usuário"
            value={gitUser}
            onChange={this.handleInputChange}
          />

          <SubmitButton loading={loading}>
            {loading ? (
              <FaSpinner color="#FFF" size={14} />
            ) : (
              <FaPlus color="#FFF" size={14} />
            )}
          </SubmitButton>
        </Form>

        <List>
          {repositories.map((repo) => (
            <li key={repo.name}>
              <span>{repo.name}</span>
              <Link to={`/details/${encodeURIComponent(repo.url)}`}>
                <FaListAlt color="EEE" size={14} />
              </Link>
            </li>
          ))}
        </List>
      </Container>
    );
  }
}
